-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "loyalty_discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "loyalty_points_redeemed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loyalty_reward_id" BIGINT,
ADD COLUMN     "loyalty_reward_snapshot" JSONB;

-- AlterTable
ALTER TABLE "pending_checkouts" ADD COLUMN     "loyalty_reward_id" BIGINT,
ADD COLUMN     "loyalty_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loyalty_discount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "settings" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',
    "group_label" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "key_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_tiers" (
    "id" BIGSERIAL NOT NULL,
    "multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "min_lifetime_points" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_tier_translations" (
    "id" BIGSERIAL NOT NULL,
    "record_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "loyalty_tier_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_accounts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "available_points" INTEGER NOT NULL DEFAULT 0,
    "pending_points" INTEGER NOT NULL DEFAULT 0,
    "lifetime_points" INTEGER NOT NULL DEFAULT 0,
    "current_tier_id" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_earning_rules" (
    "id" BIGSERIAL NOT NULL,
    "event_key" TEXT NOT NULL,
    "points_type" TEXT NOT NULL,
    "points_value" DECIMAL(12,2) NOT NULL,
    "min_order_amount" DECIMAL(12,2),
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_earning_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_earning_rule_translations" (
    "id" BIGSERIAL NOT NULL,
    "record_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "loyalty_earning_rule_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_rewards" (
    "id" BIGSERIAL NOT NULL,
    "points_required" INTEGER NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" DECIMAL(12,2) NOT NULL,
    "max_discount_amount" DECIMAL(12,2),
    "min_order_amount" DECIMAL(12,2),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_reward_translations" (
    "id" BIGSERIAL NOT NULL,
    "record_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "loyalty_reward_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_reward_redemptions" (
    "id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "reward_id" BIGINT NOT NULL,
    "pending_checkout_id" BIGINT,
    "order_id" BIGINT,
    "points" INTEGER NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL DEFAULT 'held',
    "reward_snapshot" JSONB NOT NULL,
    "released_at" TIMESTAMP(3),
    "redeemed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_point_transactions" (
    "id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "earning_rule_id" BIGINT,
    "reward_id" BIGINT,
    "redemption_id" BIGINT,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "available_delta" INTEGER NOT NULL DEFAULT 0,
    "pending_delta" INTEGER NOT NULL DEFAULT 0,
    "lifetime_delta" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "reference_type" TEXT,
    "reference_id" TEXT,
    "idempotency_key" TEXT,
    "description" TEXT,
    "expires_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
CREATE INDEX "settings_group_idx" ON "settings"("group");
CREATE INDEX "loyalty_tiers_is_active_min_lifetime_points_idx" ON "loyalty_tiers"("is_active", "min_lifetime_points");
CREATE UNIQUE INDEX "loyalty_tier_translations_record_id_lang_id_key" ON "loyalty_tier_translations"("record_id", "lang_id");
CREATE UNIQUE INDEX "loyalty_accounts_user_id_key" ON "loyalty_accounts"("user_id");
CREATE INDEX "loyalty_accounts_current_tier_id_idx" ON "loyalty_accounts"("current_tier_id");
CREATE INDEX "loyalty_accounts_status_idx" ON "loyalty_accounts"("status");
CREATE UNIQUE INDEX "loyalty_earning_rules_event_key_key" ON "loyalty_earning_rules"("event_key");
CREATE INDEX "loyalty_earning_rules_is_active_event_key_idx" ON "loyalty_earning_rules"("is_active", "event_key");
CREATE UNIQUE INDEX "loyalty_earning_rule_translations_record_id_lang_id_key" ON "loyalty_earning_rule_translations"("record_id", "lang_id");
CREATE INDEX "loyalty_rewards_is_active_reward_type_idx" ON "loyalty_rewards"("is_active", "reward_type");
CREATE UNIQUE INDEX "loyalty_reward_translations_record_id_lang_id_key" ON "loyalty_reward_translations"("record_id", "lang_id");
CREATE UNIQUE INDEX "loyalty_reward_redemptions_pending_checkout_id_key" ON "loyalty_reward_redemptions"("pending_checkout_id");
CREATE INDEX "loyalty_reward_redemptions_user_id_status_idx" ON "loyalty_reward_redemptions"("user_id", "status");
CREATE INDEX "loyalty_reward_redemptions_reward_id_idx" ON "loyalty_reward_redemptions"("reward_id");
CREATE INDEX "loyalty_reward_redemptions_order_id_idx" ON "loyalty_reward_redemptions"("order_id");
CREATE UNIQUE INDEX "loyalty_point_transactions_idempotency_key_key" ON "loyalty_point_transactions"("idempotency_key");
CREATE INDEX "loyalty_point_transactions_account_id_status_created_at_idx" ON "loyalty_point_transactions"("account_id", "status", "created_at" DESC);
CREATE INDEX "loyalty_point_transactions_user_id_created_at_idx" ON "loyalty_point_transactions"("user_id", "created_at" DESC);
CREATE INDEX "loyalty_point_transactions_reference_type_reference_id_idx" ON "loyalty_point_transactions"("reference_type", "reference_id");

-- AddForeignKey
ALTER TABLE "loyalty_tier_translations" ADD CONSTRAINT "loyalty_tier_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "loyalty_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_current_tier_id_fkey" FOREIGN KEY ("current_tier_id") REFERENCES "loyalty_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loyalty_earning_rule_translations" ADD CONSTRAINT "loyalty_earning_rule_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "loyalty_earning_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_reward_translations" ADD CONSTRAINT "loyalty_reward_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "loyalty_rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_reward_redemptions" ADD CONSTRAINT "loyalty_reward_redemptions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_reward_redemptions" ADD CONSTRAINT "loyalty_reward_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_reward_redemptions" ADD CONSTRAINT "loyalty_reward_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "loyalty_rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loyalty_reward_redemptions" ADD CONSTRAINT "loyalty_reward_redemptions_pending_checkout_id_fkey" FOREIGN KEY ("pending_checkout_id") REFERENCES "pending_checkouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loyalty_reward_redemptions" ADD CONSTRAINT "loyalty_reward_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loyalty_point_transactions" ADD CONSTRAINT "loyalty_point_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_point_transactions" ADD CONSTRAINT "loyalty_point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_point_transactions" ADD CONSTRAINT "loyalty_point_transactions_earning_rule_id_fkey" FOREIGN KEY ("earning_rule_id") REFERENCES "loyalty_earning_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loyalty_point_transactions" ADD CONSTRAINT "loyalty_point_transactions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "loyalty_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loyalty_point_transactions" ADD CONSTRAINT "loyalty_point_transactions_redemption_id_fkey" FOREIGN KEY ("redemption_id") REFERENCES "loyalty_reward_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
