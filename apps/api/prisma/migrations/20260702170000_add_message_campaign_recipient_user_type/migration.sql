ALTER TABLE "message_campaigns"
  ADD COLUMN IF NOT EXISTS "recipient_user_type" TEXT,
  ADD COLUMN IF NOT EXISTS "locale" TEXT NOT NULL DEFAULT 'profile';
