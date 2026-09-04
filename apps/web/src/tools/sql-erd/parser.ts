import { splitStatements, tokenize, type Token } from "./tokenizer";
import type {
  ParseIssue,
  ParsedColumn,
  ParsedIndex,
  ParsedRelation,
  ParsedSchema,
  ParsedTable,
  RelationCardinality,
} from "./types";

/** Keywords that end a column's type or default expression inside a column definition. */
const COLUMN_MODIFIER_KEYWORDS = new Set([
  "NOT",
  "NULL",
  "DEFAULT",
  "PRIMARY",
  "UNIQUE",
  "REFERENCES",
  "CHECK",
  "CONSTRAINT",
  "GENERATED",
  "COLLATE",
  "COMMENT",
  "AUTO_INCREMENT",
  "AUTOINCREMENT",
  "IDENTITY",
  "STORED",
  "VIRTUAL",
  "ALWAYS",
  "AS",
  "DEFERRABLE",
  "INITIALLY",
  "ON",
  "KEY",
  "ENFORCED",
  "INVISIBLE",
  "VISIBLE",
  "FIRST",
  "AFTER",
]);

const TABLE_CONSTRAINT_KEYWORDS = new Set([
  "CONSTRAINT",
  "PRIMARY",
  "UNIQUE",
  "FOREIGN",
  "CHECK",
  "EXCLUDE",
  "INDEX",
  "KEY",
  "FULLTEXT",
  "SPATIAL",
  "PERIOD",
]);

/** Types whose declaration implies both NOT NULL-able identity and a server default. */
const SERIAL_TYPES = new Set(["serial", "bigserial", "smallserial", "serial4", "serial8"]);

class TokenCursor {
  private readonly tokens: Token[];
  private position = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  get done(): boolean {
    return this.position >= this.tokens.length;
  }

  peek(offset = 0): Token | undefined {
    return this.tokens[this.position + offset];
  }

  next(): Token | undefined {
    const token = this.tokens[this.position];
    this.position += 1;
    return token;
  }

  isWord(word: string, offset = 0): boolean {
    const token = this.peek(offset);
    return token?.kind === "word" && token.upper === word;
  }

  isPunct(value: string, offset = 0): boolean {
    const token = this.peek(offset);
    return token?.kind === "punct" && token.value === value;
  }

  /** Consumes the given keyword sequence only when all of it matches. */
  matchWords(...words: string[]): boolean {
    for (let offset = 0; offset < words.length; offset += 1) {
      if (!this.isWord(words[offset], offset)) {
        return false;
      }
    }

    this.position += words.length;
    return true;
  }

  matchPunct(value: string): boolean {
    if (!this.isPunct(value)) {
      return false;
    }

    this.position += 1;
    return true;
  }

  /** Consumes a balanced `( ... )` group and returns the tokens inside it. */
  readParenGroup(): Token[] {
    if (!this.matchPunct("(")) {
      return [];
    }

    const inner: Token[] = [];
    let depth = 1;

    while (!this.done) {
      const token = this.next();

      if (!token) {
        break;
      }

      if (token.kind === "punct" && token.value === "(") {
        depth += 1;
      } else if (token.kind === "punct" && token.value === ")") {
        depth -= 1;

        if (depth === 0) {
          break;
        }
      }

      inner.push(token);
    }

    return inner;
  }

  /** Skips tokens until the next top-level keyword the caller cares about. */
  skipUntilKeyword(stopWords: Set<string>): void {
    while (!this.done) {
      const token = this.peek();

      if (!token) {
        return;
      }

      if (token.kind === "punct" && token.value === "(") {
        this.readParenGroup();
        continue;
      }

      if (token.kind === "word" && stopWords.has(token.upper)) {
        return;
      }

      this.next();
    }
  }
}

function isNameToken(token: Token | undefined): boolean {
  return token?.kind === "ident" || token?.kind === "word";
}

interface QualifiedName {
  schema?: string;
  name: string;
}

function readQualifiedName(cursor: TokenCursor): QualifiedName | null {
  if (!isNameToken(cursor.peek())) {
    return null;
  }

  const parts = [cursor.next()!.value];

  while (cursor.isPunct(".") && isNameToken(cursor.peek(1))) {
    cursor.next();
    parts.push(cursor.next()!.value);
  }

  const name = parts[parts.length - 1];
  const schema = parts.length > 1 ? parts[parts.length - 2] : undefined;

  return { name, schema };
}

/** `public` is the implicit schema, so it is dropped to keep ids comparable. */
function makeTableId(name: string, schema?: string): string {
  const normalizedSchema = schema?.toLowerCase();

  if (!normalizedSchema || normalizedSchema === "public" || normalizedSchema === "dbo") {
    return name.toLowerCase();
  }

  return `${normalizedSchema}.${name.toLowerCase()}`;
}

function splitTopLevel(tokens: Token[]): Token[][] {
  const groups: Token[][] = [];
  let current: Token[] = [];
  let depth = 0;

  for (const token of tokens) {
    if (token.kind === "punct" && token.value === "(") {
      depth += 1;
    } else if (token.kind === "punct" && token.value === ")") {
      depth -= 1;
    } else if (token.kind === "punct" && token.value === "," && depth === 0) {
      groups.push(current);
      current = [];
      continue;
    }

    current.push(token);
  }

  if (current.length) {
    groups.push(current);
  }

  return groups;
}

/** Pulls column names out of an index/constraint list, ignoring ASC/DESC and expressions. */
function readColumnList(tokens: Token[]): string[] {
  return splitTopLevel(tokens)
    .map((group) => group.find(isNameToken))
    .filter((token): token is Token => Boolean(token))
    .map((token) => token.value);
}

function readTypeText(cursor: TokenCursor): string {
  let text = "";

  while (!cursor.done) {
    const token = cursor.peek();

    if (!token) {
      break;
    }

    if (token.kind === "punct" && token.value === ",") {
      break;
    }

    if (token.kind === "word" && COLUMN_MODIFIER_KEYWORDS.has(token.upper) && text) {
      break;
    }

    if (token.kind === "punct" && token.value === "(") {
      const inner = cursor.readParenGroup();
      const innerText = inner
        .map((entry) => (entry.kind === "string" ? `'${entry.value}'` : entry.value))
        .join("");
      text += `(${innerText})`;
      continue;
    }

    cursor.next();

    if (token.kind === "punct") {
      text += token.value;
    } else {
      text += (text && !text.endsWith("(") ? " " : "") + token.value;
    }
  }

  return text.trim();
}

/** Condenses a raw SQL type into the short label shown on a node row. */
function toDisplayType(rawType: string): string {
  const type = rawType.toLowerCase().trim();

  if (!type) {
    return "?";
  }

  if (type.startsWith("timestamp") || type.startsWith("timestamptz")) {
    return type.includes("with time zone") || type.startsWith("timestamptz")
      ? "timestamptz"
      : "timestamp";
  }

  if (type.startsWith("enum") || type.startsWith("set(")) {
    return "enum";
  }

  if (type.startsWith("character varying") || type.startsWith("varchar")) {
    return "varchar";
  }

  if (type.startsWith("character") || type.startsWith("char")) {
    return "char";
  }

  if (type.startsWith("double precision")) {
    return "float";
  }

  if (SERIAL_TYPES.has(type)) {
    return "serial";
  }

  const base = type
    .split("(")[0]
    .replace(/\[\s*\d*\s*\]/g, "")
    .replace(/\s+(unsigned|signed|zerofill)\b/g, "")
    .trim();

  return type.includes("[") ? `${base}[]` : base;
}

interface InlineReference {
  targetTable: QualifiedName;
  targetColumns: string[];
  constraintName?: string;
  onDelete?: string;
  onUpdate?: string;
}

function readReferentialActions(cursor: TokenCursor): { onDelete?: string; onUpdate?: string } {
  const actions: { onDelete?: string; onUpdate?: string } = {};

  while (cursor.isWord("ON")) {
    cursor.next();
    const kind = cursor.next();
    const actionWords: string[] = [];

    while (
      isNameToken(cursor.peek()) &&
      ["CASCADE", "RESTRICT", "NO", "ACTION", "SET", "NULL", "DEFAULT"].includes(
        cursor.peek()!.upper,
      )
    ) {
      actionWords.push(cursor.next()!.upper);
    }

    const action = actionWords.join(" ");

    if (kind?.upper === "DELETE") {
      actions.onDelete = action;
    } else if (kind?.upper === "UPDATE") {
      actions.onUpdate = action;
    }
  }

  return actions;
}

function readReference(cursor: TokenCursor): InlineReference | null {
  const targetTable = readQualifiedName(cursor);

  if (!targetTable) {
    return null;
  }

  const targetColumns = cursor.isPunct("(") ? readColumnList(cursor.readParenGroup()) : [];
  const actions = readReferentialActions(cursor);

  return { targetTable, targetColumns, ...actions };
}

interface ColumnDefinitionResult {
  column: ParsedColumn;
  reference?: InlineReference;
  isPrimaryKey: boolean;
}

function parseColumnDefinition(tokens: Token[]): ColumnDefinitionResult | null {
  const cursor = new TokenCursor(tokens);
  const nameToken = cursor.next();

  if (!isNameToken(nameToken)) {
    return null;
  }

  const rawType = readTypeText(cursor);
  const normalizedType = rawType.toLowerCase();

  const column: ParsedColumn = {
    name: nameToken!.value,
    type: normalizedType,
    displayType: toDisplayType(normalizedType),
    nullable: true,
    isPrimaryKey: false,
    isUnique: false,
    hasDefault: SERIAL_TYPES.has(normalizedType),
    isAutoIncrement: SERIAL_TYPES.has(normalizedType),
  };

  let reference: InlineReference | undefined;

  while (!cursor.done) {
    if (cursor.matchWords("NOT", "NULL")) {
      column.nullable = false;
      continue;
    }

    if (cursor.matchWords("PRIMARY", "KEY")) {
      column.isPrimaryKey = true;
      column.nullable = false;
      continue;
    }

    if (cursor.matchWords("UNIQUE", "KEY") || cursor.matchWords("UNIQUE")) {
      column.isUnique = true;
      continue;
    }


    if (cursor.matchWords("DEFAULT")) {
      // `DEFAULT NULL` is the absence of a default, not a default value.
      column.hasDefault = !cursor.isWord("NULL");
      cursor.skipUntilKeyword(COLUMN_MODIFIER_KEYWORDS);
      continue;
    }

    if (cursor.matchWords("REFERENCES")) {
      reference = readReference(cursor) ?? undefined;
      continue;
    }

    if (cursor.matchWords("AUTO_INCREMENT") || cursor.matchWords("AUTOINCREMENT")) {
      column.isAutoIncrement = true;
      column.hasDefault = true;
      continue;
    }

    if (cursor.matchWords("GENERATED")) {
      column.hasDefault = true;
      cursor.skipUntilKeyword(COLUMN_MODIFIER_KEYWORDS);
      continue;
    }

    if (cursor.matchWords("IDENTITY")) {
      column.hasDefault = true;
      column.isAutoIncrement = true;
      column.nullable = false;
      continue;
    }

    if (cursor.matchWords("COMMENT")) {
      const commentToken = cursor.peek();

      if (commentToken?.kind === "string") {
        column.comment = commentToken.value;
        cursor.next();
      }

      continue;
    }

    if (cursor.matchWords("NULL")) {
      column.nullable = true;
      continue;
    }

    // Anything else (CHECK, COLLATE, storage hints) does not affect the diagram.
    cursor.next();
  }

  return { column, reference, isPrimaryKey: column.isPrimaryKey };
}

interface TableConstraintResult {
  primaryKey?: string[];
  unique?: ParsedIndex;
  index?: ParsedIndex;
  foreignKey?: { columns: string[]; reference: InlineReference; name?: string };
}

function parseTableConstraint(tokens: Token[]): TableConstraintResult | null {
  const cursor = new TokenCursor(tokens);
  let constraintName: string | undefined;

  if (cursor.matchWords("CONSTRAINT")) {
    if (isNameToken(cursor.peek()) && !TABLE_CONSTRAINT_KEYWORDS.has(cursor.peek()!.upper)) {
      constraintName = cursor.next()!.value;
    }
  }

  if (cursor.matchWords("PRIMARY", "KEY")) {
    // MySQL allows an index type/name between the keyword and the column list.
    while (!cursor.isPunct("(") && !cursor.done) {
      cursor.next();
    }

    return { primaryKey: readColumnList(cursor.readParenGroup()) };
  }

  if (cursor.matchWords("FOREIGN", "KEY")) {
    while (!cursor.isPunct("(") && !cursor.done) {
      cursor.next();
    }

    const columns = readColumnList(cursor.readParenGroup());

    if (!cursor.matchWords("REFERENCES")) {
      return null;
    }

    const reference = readReference(cursor);

    if (!reference) {
      return null;
    }

    return { foreignKey: { columns, reference, name: constraintName } };
  }

  if (cursor.matchWords("UNIQUE")) {
    if (!cursor.matchWords("KEY")) {
      cursor.matchWords("INDEX");
    }

    while (!cursor.isPunct("(") && !cursor.done) {
      const token = cursor.next();

      if (isNameToken(token) && !constraintName) {
        constraintName = token!.value;
      }
    }

    return {
      unique: { name: constraintName, columns: readColumnList(cursor.readParenGroup()), unique: true },
    };
  }

  if (cursor.matchWords("INDEX") || cursor.matchWords("KEY")) {
    while (!cursor.isPunct("(") && !cursor.done) {
      const token = cursor.next();

      if (isNameToken(token) && !constraintName) {
        constraintName = token!.value;
      }
    }

    return {
      index: { name: constraintName, columns: readColumnList(cursor.readParenGroup()), unique: false },
    };
  }

  return null;
}

interface PendingForeignKey {
  sourceTable: string;
  sourceColumns: string[];
  target: QualifiedName;
  targetColumns: string[];
  name?: string;
  onDelete?: string;
  onUpdate?: string;
  fileId: string;
}

interface ParseContext {
  tables: Map<string, ParsedTable>;
  foreignKeys: PendingForeignKey[];
  issues: ParseIssue[];
  /** Names declared by CREATE TYPE ... AS ENUM, so columns using them read as "enum". */
  enumTypes: Set<string>;
}

function parseCreateTable(cursor: TokenCursor, fileId: string, context: ParseContext): void {
  const qualifiedName = readQualifiedName(cursor);

  if (!qualifiedName) {
    return;
  }

  if (!cursor.isPunct("(")) {
    // CREATE TABLE ... AS SELECT / LIKE: no column list to read.
    context.issues.push({
      fileId,
      message: `Skipped "${qualifiedName.name}" — only CREATE TABLE statements with a column list are supported.`,
    });
    return;
  }

  const body = cursor.readParenGroup();
  const tableId = makeTableId(qualifiedName.name, qualifiedName.schema);

  const table: ParsedTable = {
    id: tableId,
    schema: qualifiedName.schema,
    name: qualifiedName.name,
    columns: [],
    primaryKey: [],
    indexes: [],
    fileId,
    isStub: false,
  };

  for (const entry of splitTopLevel(body)) {
    if (!entry.length) {
      continue;
    }

    const first = entry[0];
    const isConstraint = first.kind === "word" && TABLE_CONSTRAINT_KEYWORDS.has(first.upper);

    if (isConstraint) {
      const constraint = parseTableConstraint(entry);

      if (!constraint) {
        continue;
      }

      if (constraint.primaryKey) {
        table.primaryKey = constraint.primaryKey;
      }

      if (constraint.unique) {
        table.indexes.push(constraint.unique);
      }

      if (constraint.index) {
        table.indexes.push(constraint.index);
      }

      if (constraint.foreignKey) {
        context.foreignKeys.push({
          sourceTable: tableId,
          sourceColumns: constraint.foreignKey.columns,
          target: constraint.foreignKey.reference.targetTable,
          targetColumns: constraint.foreignKey.reference.targetColumns,
          name: constraint.foreignKey.name,
          onDelete: constraint.foreignKey.reference.onDelete,
          onUpdate: constraint.foreignKey.reference.onUpdate,
          fileId,
        });
      }

      continue;
    }

    const definition = parseColumnDefinition(entry);

    if (!definition) {
      continue;
    }

    table.columns.push(definition.column);

    if (definition.isPrimaryKey && !table.primaryKey.includes(definition.column.name)) {
      table.primaryKey.push(definition.column.name);
    }

    if (definition.reference) {
      context.foreignKeys.push({
        sourceTable: tableId,
        sourceColumns: [definition.column.name],
        target: definition.reference.targetTable,
        targetColumns: definition.reference.targetColumns,
        onDelete: definition.reference.onDelete,
        onUpdate: definition.reference.onUpdate,
        fileId,
      });
    }
  }

  const existing = context.tables.get(tableId);

  if (existing && !existing.isStub) {
    context.issues.push({
      fileId,
      message: `Duplicate definition of "${qualifiedName.name}" — the later one wins.`,
    });
  }

  context.tables.set(tableId, table);
}

function parseAlterTable(cursor: TokenCursor, fileId: string, context: ParseContext): void {
  cursor.matchWords("IF", "EXISTS");
  cursor.matchWords("ONLY");

  const qualifiedName = readQualifiedName(cursor);

  if (!qualifiedName) {
    return;
  }

  const tableId = makeTableId(qualifiedName.name, qualifiedName.schema);

  while (!cursor.done) {
    if (!cursor.matchWords("ADD")) {
      cursor.next();
      continue;
    }

    cursor.matchWords("COLUMN");

    // Re-use the table-constraint parser by handing it the rest of the clause.
    const rest: Token[] = [];

    while (!cursor.done) {
      const token = cursor.next();

      if (!token) {
        break;
      }

      if (token.kind === "punct" && token.value === "(") {
        rest.push(token);
        let depth = 1;

        while (!cursor.done && depth > 0) {
          const innerToken = cursor.next()!;

          if (innerToken.kind === "punct" && innerToken.value === "(") {
            depth += 1;
          }

          if (innerToken.kind === "punct" && innerToken.value === ")") {
            depth -= 1;
          }

          rest.push(innerToken);
        }

        continue;
      }

      if (token.kind === "punct" && token.value === ",") {
        break;
      }

      rest.push(token);
    }

    const constraint = parseTableConstraint(rest);
    const table = context.tables.get(tableId);

    if (constraint?.foreignKey) {
      context.foreignKeys.push({
        sourceTable: tableId,
        sourceColumns: constraint.foreignKey.columns,
        target: constraint.foreignKey.reference.targetTable,
        targetColumns: constraint.foreignKey.reference.targetColumns,
        name: constraint.foreignKey.name,
        onDelete: constraint.foreignKey.reference.onDelete,
        onUpdate: constraint.foreignKey.reference.onUpdate,
        fileId,
      });
      continue;
    }

    if (!table) {
      continue;
    }

    if (constraint?.primaryKey) {
      table.primaryKey = constraint.primaryKey;

      for (const columnName of constraint.primaryKey) {
        const column = table.columns.find((entry) => entry.name === columnName);

        if (column) {
          column.isPrimaryKey = true;
          column.nullable = false;
        }
      }

      continue;
    }

    if (constraint?.unique) {
      table.indexes.push(constraint.unique);
      continue;
    }

    if (constraint?.index) {
      table.indexes.push(constraint.index);
      continue;
    }

    const definition = parseColumnDefinition(rest);

    if (definition && !table.columns.some((entry) => entry.name === definition.column.name)) {
      table.columns.push(definition.column);

      if (definition.reference) {
        context.foreignKeys.push({
          sourceTable: tableId,
          sourceColumns: [definition.column.name],
          target: definition.reference.targetTable,
          targetColumns: definition.reference.targetColumns,
          onDelete: definition.reference.onDelete,
          onUpdate: definition.reference.onUpdate,
          fileId,
        });
      }
    }
  }
}

function parseCreateIndex(cursor: TokenCursor, unique: boolean, context: ParseContext): void {
  cursor.matchWords("CONCURRENTLY");
  cursor.matchWords("IF", "NOT", "EXISTS");

  let indexName: string | undefined;

  if (!cursor.isWord("ON") && isNameToken(cursor.peek())) {
    indexName = readQualifiedName(cursor)?.name;
  }

  if (!cursor.matchWords("ON")) {
    return;
  }

  const qualifiedName = readQualifiedName(cursor);

  if (!qualifiedName) {
    return;
  }

  if (cursor.matchWords("USING")) {
    cursor.next();
  }

  const columns = readColumnList(cursor.readParenGroup());
  const table = context.tables.get(makeTableId(qualifiedName.name, qualifiedName.schema));

  if (table && columns.length) {
    table.indexes.push({ name: indexName, columns, unique });
  }
}

function parseComment(cursor: TokenCursor, context: ParseContext): void {
  const target = cursor.next();

  if (!target) {
    return;
  }

  const qualifiedName = readQualifiedName(cursor);

  if (!qualifiedName || !cursor.matchWords("IS")) {
    return;
  }

  const valueToken = cursor.peek();

  if (valueToken?.kind !== "string") {
    return;
  }

  if (target.upper === "TABLE") {
    const table = context.tables.get(makeTableId(qualifiedName.name, qualifiedName.schema));

    if (table) {
      table.comment = valueToken.value;
    }

    return;
  }

  if (target.upper === "COLUMN") {
    // For a column the qualified name is <table>.<column>, so `schema` holds the table.
    const table = qualifiedName.schema
      ? context.tables.get(makeTableId(qualifiedName.schema))
      : undefined;
    const column = table?.columns.find((entry) => entry.name === qualifiedName.name);

    if (column) {
      column.comment = valueToken.value;
    }
  }
}

function parseStatement(tokens: Token[], fileId: string, context: ParseContext): void {
  const cursor = new TokenCursor(tokens);

  if (cursor.matchWords("CREATE")) {
    cursor.matchWords("OR", "REPLACE");
    if (!cursor.matchWords("GLOBAL")) {
      cursor.matchWords("LOCAL");
    }

    if (!cursor.matchWords("TEMPORARY")) {
      cursor.matchWords("TEMP");
    }

    cursor.matchWords("UNLOGGED");

    const isUnique = cursor.matchWords("UNIQUE");

    if (cursor.matchWords("INDEX")) {
      parseCreateIndex(cursor, isUnique, context);
      return;
    }

    if (cursor.matchWords("TABLE")) {
      cursor.matchWords("IF", "NOT", "EXISTS");
      parseCreateTable(cursor, fileId, context);
      return;
    }

    if (cursor.matchWords("TYPE")) {
      const typeName = readQualifiedName(cursor);

      if (typeName && cursor.matchWords("AS") && cursor.matchWords("ENUM")) {
        context.enumTypes.add(typeName.name.toLowerCase());
      }
    }

    return;
  }

  if (cursor.matchWords("ALTER", "TABLE")) {
    parseAlterTable(cursor, fileId, context);
    return;
  }

  if (cursor.matchWords("COMMENT", "ON")) {
    parseComment(cursor, context);
  }
}

function columnsAreUnique(table: ParsedTable | undefined, columns: string[]): boolean {
  if (!table || !columns.length) {
    return false;
  }

  const normalized = columns.map((column) => column.toLowerCase()).sort();
  const matches = (candidate: string[]) => {
    const other = candidate.map((column) => column.toLowerCase()).sort();
    return other.length === normalized.length && other.every((value, index) => value === normalized[index]);
  };

  if (matches(table.primaryKey)) {
    return true;
  }

  if (columns.length === 1) {
    const column = table.columns.find(
      (entry) => entry.name.toLowerCase() === normalized[0],
    );

    if (column?.isUnique || column?.isPrimaryKey) {
      return true;
    }
  }

  return table.indexes.some((index) => index.unique && matches(index.columns));
}

function relationId(
  sourceTable: string,
  sourceColumns: string[],
  targetTable: string,
  targetColumns: string[],
): string {
  return `${sourceTable}(${sourceColumns.join(",")})->${targetTable}(${targetColumns.join(",")})`;
}

export interface SqlSource {
  id: string;
  sql: string;
}

/**
 * Parses one or more SQL files into a single schema. Tables referenced by a
 * foreign key but never defined are kept as stubs so the diagram stays connected.
 */
export function parseSqlFiles(sources: SqlSource[]): ParsedSchema {
  const context: ParseContext = {
    tables: new Map(),
    foreignKeys: [],
    issues: [],
    enumTypes: new Set(),
  };

  for (const source of sources) {
    try {
      for (const statement of splitStatements(tokenize(source.sql))) {
        parseStatement(statement, source.id, context);
      }
    } catch (error) {
      context.issues.push({
        fileId: source.id,
        message: error instanceof Error ? error.message : "Failed to parse file.",
      });
    }
  }

  // Enum types may be declared in a later file than the tables using them.
  if (context.enumTypes.size) {
    for (const table of context.tables.values()) {
      for (const column of table.columns) {
        const baseType = column.type.split("(")[0].split(".").pop()?.trim() ?? "";

        if (context.enumTypes.has(baseType)) {
          column.displayType = "enum";
        }
      }
    }
  }

  const relations: ParsedRelation[] = [];
  const seenRelationIds = new Set<string>();

  for (const foreignKey of context.foreignKeys) {
    const targetId = makeTableId(foreignKey.target.name, foreignKey.target.schema);
    let targetTable = context.tables.get(targetId);

    if (!targetTable) {
      targetTable = {
        id: targetId,
        schema: foreignKey.target.schema,
        name: foreignKey.target.name,
        columns: [],
        primaryKey: [],
        indexes: [],
        fileId: foreignKey.fileId,
        isStub: true,
      };
      context.tables.set(targetId, targetTable);
    }

    const targetColumns = foreignKey.targetColumns.length
      ? foreignKey.targetColumns
      : targetTable.primaryKey.length
        ? targetTable.primaryKey
        : ["id"];

    // A stub only knows the columns other tables point at, so backfill them.
    if (targetTable.isStub) {
      for (const columnName of targetColumns) {
        if (!targetTable.columns.some((entry) => entry.name === columnName)) {
          targetTable.columns.push({
            name: columnName,
            type: "",
            displayType: "?",
            nullable: false,
            isPrimaryKey: true,
            isUnique: true,
            hasDefault: false,
            isAutoIncrement: false,
          });
        }
      }
    }

    const id = relationId(
      foreignKey.sourceTable,
      foreignKey.sourceColumns,
      targetId,
      targetColumns,
    );

    if (seenRelationIds.has(id)) {
      continue;
    }

    seenRelationIds.add(id);

    const sourceTable = context.tables.get(foreignKey.sourceTable);
    const cardinality: RelationCardinality = columnsAreUnique(sourceTable, foreignKey.sourceColumns)
      ? "one-to-one"
      : "many-to-one";

    relations.push({
      id,
      name: foreignKey.name,
      sourceTable: foreignKey.sourceTable,
      sourceColumns: foreignKey.sourceColumns,
      targetTable: targetId,
      targetColumns,
      cardinality,
      onDelete: foreignKey.onDelete,
      onUpdate: foreignKey.onUpdate,
      origin: "derived",
      fileId: foreignKey.fileId,
    });
  }

  return {
    tables: [...context.tables.values()],
    relations,
    issues: context.issues,
  };
}
