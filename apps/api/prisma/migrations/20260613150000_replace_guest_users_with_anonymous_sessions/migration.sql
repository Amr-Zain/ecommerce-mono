CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "anonymous_sessions" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "anonymous_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "anonymous_sessions_token_hash_key" ON "anonymous_sessions"("token_hash");
CREATE INDEX "anonymous_sessions_expires_at_idx" ON "anonymous_sessions"("expires_at");

ALTER TABLE "carts" ADD COLUMN "anonymous_session_id" TEXT;
ALTER TABLE "carts" ALTER COLUMN "user_id" DROP NOT NULL;
CREATE UNIQUE INDEX "carts_anonymous_session_id_key" ON "carts"("anonymous_session_id");

ALTER TABLE "wishlist_items" ADD COLUMN "anonymous_session_id" TEXT;
ALTER TABLE "wishlist_items" ALTER COLUMN "user_id" DROP NOT NULL;
CREATE UNIQUE INDEX "wishlist_items_anonymous_session_id_product_id_key"
  ON "wishlist_items"("anonymous_session_id", "product_id");
CREATE INDEX "wishlist_items_anonymous_session_id_idx" ON "wishlist_items"("anonymous_session_id");

ALTER TABLE "carts" ADD CONSTRAINT "carts_owner_check"
  CHECK (
    (user_id IS NOT NULL AND anonymous_session_id IS NULL)
    OR
    (user_id IS NULL AND anonymous_session_id IS NOT NULL)
  );
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_owner_check"
  CHECK (
    (user_id IS NOT NULL AND anonymous_session_id IS NULL)
    OR
    (user_id IS NULL AND anonymous_session_id IS NOT NULL)
  );

ALTER TABLE "carts" ADD CONSTRAINT "carts_anonymous_session_id_fkey"
  FOREIGN KEY ("anonymous_session_id") REFERENCES "anonymous_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_anonymous_session_id_fkey"
  FOREIGN KEY ("anonymous_session_id") REFERENCES "anonymous_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "anonymous_sessions" ("id", "token_hash", "expires_at", "last_active_at", "created_at")
SELECT
  md5(random()::text || clock_timestamp()::text || id::text),
  encode(digest("guest_token", 'sha256'), 'hex'),
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  CURRENT_TIMESTAMP,
  "created_at"
FROM "users"
WHERE "guest_token" IS NOT NULL;

UPDATE "carts" AS c
SET "anonymous_session_id" = s."id", "user_id" = NULL
FROM "users" AS u
JOIN "anonymous_sessions" AS s ON s."token_hash" = encode(digest(u."guest_token", 'sha256'), 'hex')
WHERE c."user_id" = u."id" AND u."guest_token" IS NOT NULL;

UPDATE "wishlist_items" AS w
SET "anonymous_session_id" = s."id", "user_id" = NULL
FROM "users" AS u
JOIN "anonymous_sessions" AS s ON s."token_hash" = encode(digest(u."guest_token", 'sha256'), 'hex')
WHERE w."user_id" = u."id" AND u."guest_token" IS NOT NULL;

DELETE FROM "users" u
WHERE u."guest_token" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "addresses" a WHERE a."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "orders" o WHERE o."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "reviews" r WHERE r."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "return_requests" r WHERE r."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "exchange_requests" e WHERE e."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "wallets" w WHERE w."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "wallet_transactions" w WHERE w."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "wallet_withdrawal_requests" w WHERE w."user_id" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "notifications" n WHERE n."recipient_id" = u."id");

ALTER TABLE "users" DROP COLUMN "guest_token";
ALTER TABLE "users" ALTER COLUMN "name" DROP DEFAULT;
