CREATE TABLE "outbox_events" (
  "id" BIGSERIAL PRIMARY KEY,
  "event_id" TEXT NOT NULL UNIQUE,
  "event_name" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "aggregate_type" TEXT NOT NULL,
  "aggregate_id" TEXT NOT NULL,
  "actor" JSONB,
  "payload" JSONB NOT NULL,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "locked_at" TIMESTAMP(3),
  "processed_at" TIMESTAMP(3),
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");
CREATE INDEX "outbox_events_locked_at_idx" ON "outbox_events"("locked_at");
CREATE INDEX "outbox_events_processed_at_idx" ON "outbox_events"("processed_at");

CREATE TABLE "event_consumer_receipts" (
  "id" BIGSERIAL PRIMARY KEY,
  "event_id" TEXT NOT NULL,
  "consumer_name" TEXT NOT NULL,
  "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_consumer_receipts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "outbox_events"("event_id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "event_consumer_receipts_event_id_consumer_name_key" ON "event_consumer_receipts"("event_id", "consumer_name");

CREATE TABLE "notifications" (
  "id" BIGSERIAL PRIMARY KEY,
  "recipient_id" BIGINT NOT NULL,
  "event_id" TEXT NOT NULL,
  "notification_type" TEXT NOT NULL,
  "title_key" TEXT NOT NULL,
  "body_key" TEXT NOT NULL,
  "args" JSONB,
  "data" JSONB,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "notifications_event_id_recipient_id_notification_type_key" ON "notifications"("event_id", "recipient_id", "notification_type");
CREATE INDEX "notifications_recipient_id_read_at_created_at_idx" ON "notifications"("recipient_id", "read_at", "created_at");
