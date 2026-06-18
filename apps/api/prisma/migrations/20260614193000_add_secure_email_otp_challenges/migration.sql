CREATE TABLE "email_otp_challenges" (
    "id" TEXT NOT NULL,
    "user_id" BIGINT,
    "recipient" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "request_ip" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "active_key" TEXT,
    "consumed_at" TIMESTAMP(3),
    "invalidated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_otp_challenges_active_key_key" ON "email_otp_challenges"("active_key");
CREATE INDEX "email_otp_challenges_recipient_purpose_created_at_idx"
  ON "email_otp_challenges"("recipient", "purpose", "created_at");
CREATE INDEX "email_otp_challenges_request_ip_created_at_idx"
  ON "email_otp_challenges"("request_ip", "created_at");
CREATE INDEX "email_otp_challenges_expires_at_idx" ON "email_otp_challenges"("expires_at");

ALTER TABLE "email_otp_challenges" ADD CONSTRAINT "email_otp_challenges_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" DROP COLUMN "email_verification_code";
ALTER TABLE "users" DROP COLUMN "email_verification_expiry";
ALTER TABLE "users" DROP COLUMN "password_reset_code";
ALTER TABLE "users" DROP COLUMN "password_reset_expiry";
