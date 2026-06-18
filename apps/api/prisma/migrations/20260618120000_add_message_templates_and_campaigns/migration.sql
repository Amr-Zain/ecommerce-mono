CREATE TABLE "message_templates" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_templates_key_key" ON "message_templates"("key");
CREATE INDEX "message_templates_channel_purpose_is_active_idx" ON "message_templates"("channel", "purpose", "is_active");

CREATE TABLE "message_campaigns" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "sender_id" BIGINT,
    "channel" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "title_override" TEXT,
    "variables" JSONB,
    "template_snapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "queued_count" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "message_campaigns_status_created_at_idx" ON "message_campaigns"("status", "created_at");
CREATE INDEX "message_campaigns_template_id_idx" ON "message_campaigns"("template_id");
ALTER TABLE "message_campaigns" ADD CONSTRAINT "message_campaigns_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "message_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "message_campaigns" ADD CONSTRAINT "message_campaigns_sender_id_fkey"
  FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "message_campaign_recipients" (
    "id" BIGSERIAL NOT NULL,
    "campaign_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "channel" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_campaign_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_campaign_recipients_campaign_id_user_id_channel_key"
  ON "message_campaign_recipients"("campaign_id", "user_id", "channel");
CREATE INDEX "message_campaign_recipients_campaign_id_status_idx"
  ON "message_campaign_recipients"("campaign_id", "status");
CREATE INDEX "message_campaign_recipients_user_id_idx" ON "message_campaign_recipients"("user_id");
ALTER TABLE "message_campaign_recipients" ADD CONSTRAINT "message_campaign_recipients_campaign_id_fkey"
  FOREIGN KEY ("campaign_id") REFERENCES "message_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_campaign_recipients" ADD CONSTRAINT "message_campaign_recipients_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
