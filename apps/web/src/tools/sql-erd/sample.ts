export interface SampleSqlFile {
  name: string;
  sql: string;
}

const CORE_SQL = `-- Core identity + event tables.

CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  name        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  starts_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendees (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  text REFERENCES events (id) ON DELETE CASCADE,
  email     text
);

CREATE TABLE attendee_groups (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  text REFERENCES events (id) ON DELETE CASCADE,
  name      text
);
`;

const CAMPAIGN_SQL = `-- Campaign delivery tables.

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent');

CREATE TABLE campaign (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    text NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'draft',
  created_by  uuid NOT NULL REFERENCES users (id),
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaign_event_status_idx ON campaign (event_id, status);

CREATE TABLE campaign_collaborator (
  campaign_id uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, user_id)
);

CREATE TABLE campaign_sender (
  campaign_id uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, user_id)
);

CREATE TABLE campaign_recipient (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
  attendee_group_id uuid REFERENCES attendee_groups (id) ON DELETE SET NULL,
  kind              text NOT NULL DEFAULT 'group',
  email             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX campaign_recipient_group_idx
  ON campaign_recipient (campaign_id, attendee_group_id);

CREATE INDEX campaign_recipient_email_idx
  ON campaign_recipient (campaign_id, email, kind);
`;

const MESSAGING_SQL = `-- Message templates and the sequences that send them.

CREATE TABLE message_template (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope       text NOT NULL DEFAULT 'company',
  company_id  text,
  created_by  uuid REFERENCES users (id),
  channel     text NOT NULL,
  name        text NOT NULL,
  content     jsonb NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  version     int NOT NULL DEFAULT 1,
  status      text NOT NULL DEFAULT 'active',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE message (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel     text NOT NULL,
  content     jsonb NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  template_id uuid REFERENCES message_template (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sequence (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    uuid NOT NULL REFERENCES campaign (id) ON DELETE CASCADE,
  message_id     uuid NOT NULL REFERENCES message (id) ON DELETE CASCADE,
  name           text NOT NULL,
  type           text NOT NULL,
  publish_date   timestamptz,
  status         text NOT NULL DEFAULT 'draft',
  workflow_id    text,
  position       int NOT NULL DEFAULT 0,
  failure_reason text,
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX sequence_position_idx ON sequence (campaign_id, position);
CREATE INDEX sequence_publish_idx ON sequence (status, publish_date);
`;

export const SAMPLE_SQL_FILES: readonly SampleSqlFile[] = [
  { name: "001_core.sql", sql: CORE_SQL },
  { name: "002_campaign.sql", sql: CAMPAIGN_SQL },
  { name: "003_messaging.sql", sql: MESSAGING_SQL },
];
