export interface SampleSqlFile {
  name: string;
  sql: string;
}

export interface SampleSchema {
  id: string;
  name: string;
  description: string;
  files: readonly SampleSqlFile[];
}

// ── Campaign messaging ─────────────────────────────────────────────────────

const EVENTS_SQL = `-- Event, attendee and audience-group tables.

CREATE TABLE events (
    _id                text PRIMARY KEY,
    creator_company_id text
);

CREATE TABLE attendees (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    text NOT NULL REFERENCES events (_id) ON DELETE CASCADE,
    email       text NOT NULL,
    first_name  text,
    last_name   text,
    archived_at timestamptz
);

CREATE TABLE attendee_groups (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id   text NOT NULL REFERENCES events (_id) ON DELETE CASCADE,
    name       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendee_group_members (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attendee_group_id uuid NOT NULL REFERENCES attendee_groups (id) ON DELETE CASCADE,
    attendee_id       uuid NOT NULL REFERENCES attendees (id) ON DELETE CASCADE,
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX attendee_group_members_group_attendee_idx
    ON attendee_group_members (attendee_group_id, attendee_id);
`;

const CAMPAIGN_SQL = `-- Campaigns, the people on them, and who they go to.

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'publishing', 'published', 'archived');

CREATE TABLE campaign (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     text NOT NULL REFERENCES events (_id) ON DELETE CASCADE,
    name         text NOT NULL,
    status       campaign_status NOT NULL DEFAULT 'draft',
    created_by   uuid NOT NULL,
    archived_at  timestamptz,
    published_at timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE campaign_collaborator (
    campaign_id uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
    user_id     uuid NOT NULL,
    role        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (campaign_id, user_id)
);

CREATE TABLE campaign_sender (
    campaign_id uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
    user_id     uuid NOT NULL,
    role        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (campaign_id, user_id)
);

CREATE TABLE campaign_audience (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id       uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
    attendee_group_id uuid REFERENCES attendee_groups (id) ON DELETE SET NULL,
    created_at        timestamptz NOT NULL DEFAULT now()
);

-- One snapshot row per campaign, so the primary key doubles as the foreign key.
CREATE TABLE campaign_snapshots (
    id       uuid PRIMARY KEY REFERENCES campaign (id) ON DELETE CASCADE,
    snapshot jsonb NOT NULL,
    version  text
);

CREATE TABLE company_business_address (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id      uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
    company_id       uuid NOT NULL,
    business_address jsonb NOT NULL
);
`;

const MESSAGING_SQL = `-- Messages, their per-channel payloads, and the sequences that send them.

CREATE TYPE message_kind AS ENUM ('slack', 'email');
CREATE TYPE sequence_type AS ENUM ('immediate', 'scheduled', 'recurring');
CREATE TYPE sequence_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TYPE sequence_response_status AS ENUM ('ok', 'error');

CREATE TABLE message (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id          text NOT NULL REFERENCES events (_id) ON DELETE CASCADE,
    kind              message_kind NOT NULL,
    name              text NOT NULL,
    source_message_id text,
    created_by        uuid,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Lets a per-channel table key on (message_id, kind) and stay in its own lane.
CREATE UNIQUE INDEX message_id_kind_idx ON message (id, kind);

CREATE TABLE slack_message (
    message_id uuid PRIMARY KEY REFERENCES message (id) ON DELETE CASCADE,
    channel_id text NOT NULL,
    thread_id  text UNIQUE,
    blocks     jsonb
);

CREATE TABLE email_message (
    message_id   uuid PRIMARY KEY REFERENCES message (id) ON DELETE CASCADE,
    channel      text NOT NULL DEFAULT 'email',
    subject      text,
    preview_text text,
    html         text
);

CREATE TABLE sequence (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
    message_id    uuid NOT NULL REFERENCES message (id) ON DELETE CASCADE,
    name          text NOT NULL,
    type          sequence_type NOT NULL,
    status        sequence_status NOT NULL DEFAULT 'draft',
    workflow_id   text,
    position      int NOT NULL DEFAULT 0,
    sent_at       timestamptz(0),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    scheduled_for bigint NOT NULL
);

CREATE TABLE sequence_response (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id uuid NOT NULL REFERENCES sequence (id) ON DELETE CASCADE,
    status      sequence_response_status,
    error_code  int,
    error_body  jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);
`;

// ── Blog ───────────────────────────────────────────────────────────────────

const BLOG_SQL = `-- A small schema: two one-to-many chains and a join table.

CREATE TABLE authors (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email        text NOT NULL UNIQUE,
    display_name text NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    uuid NOT NULL REFERENCES authors (id) ON DELETE CASCADE,
    slug         text NOT NULL UNIQUE,
    title        text NOT NULL,
    body         text NOT NULL,
    published_at timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_author_published_idx ON posts (author_id, published_at);

CREATE TABLE comments (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    parent_id  uuid REFERENCES comments (id) ON DELETE CASCADE,
    author_id  uuid REFERENCES authors (id) ON DELETE SET NULL,
    body       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tags (
    id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

CREATE TABLE post_tags (
    post_id uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    tag_id  uuid NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
`;

export const SAMPLE_SCHEMAS: readonly SampleSchema[] = [
  {
    id: "campaign-messaging",
    name: "Campaign messaging",
    description:
      "15 tables over three files — enum types, composite primary keys, a one-to-one snapshot and per-channel message subtypes.",
    files: [
      { name: "001_events.sql", sql: EVENTS_SQL },
      { name: "002_campaign.sql", sql: CAMPAIGN_SQL },
      { name: "003_messaging.sql", sql: MESSAGING_SQL },
    ],
  },
  {
    id: "blog",
    name: "Blog",
    description: "Five tables in one file — self-referencing comments and a tag join table.",
    files: [{ name: "blog.sql", sql: BLOG_SQL }],
  },
];
