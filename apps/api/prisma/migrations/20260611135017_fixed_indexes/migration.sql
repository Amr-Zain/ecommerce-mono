-- DropForeignKey
ALTER TABLE "event_consumer_receipts" DROP CONSTRAINT "event_consumer_receipts_event_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipient_id_fkey";

-- DropIndex
DROP INDEX "collections_sort_order_idx";

-- DropIndex
DROP INDEX "inventory_logs_variant_id_idx";

-- DropIndex
DROP INDEX "orders_order_number_idx";

-- DropIndex
DROP INDEX "orders_status_idx";

-- DropIndex
DROP INDEX "orders_user_id_idx";

-- DropIndex
DROP INDEX "outbox_events_locked_at_idx";

-- DropIndex
DROP INDEX "outbox_events_processed_at_idx";

-- DropIndex
DROP INDEX "price_history_variant_id_idx";

-- DropIndex
DROP INDEX "products_collection_id_idx";

-- DropIndex
DROP INDEX "refresh_tokens_token_idx";

-- DropIndex
DROP INDEX "refresh_tokens_user_id_idx";

-- DropIndex
DROP INDEX "reviews_product_id_idx";

-- DropIndex
DROP INDEX "reviews_user_id_idx";

-- DropIndex
DROP INDEX "users_email_idx";

-- DropIndex
DROP INDEX "users_guest_token_idx";

-- DropIndex
DROP INDEX "variant_attributes_product_variant_id_idx";

-- DropIndex
DROP INDEX "wallet_transactions_created_at_idx";

-- DropIndex
DROP INDEX "wallet_transactions_direction_idx";

-- DropIndex
DROP INDEX "wallet_transactions_status_idx";

-- DropIndex
DROP INDEX "wallet_transactions_type_idx";

-- DropIndex
DROP INDEX "wallet_transactions_user_id_idx";

-- DropIndex
DROP INDEX "wallet_transactions_wallet_id_idx";

-- DropIndex
DROP INDEX "wallets_user_id_idx";

-- CreateIndex
CREATE INDEX "collections_is_active_sort_order_idx" ON "collections"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "coupons_is_active_expires_at_idx" ON "coupons"("is_active", "expires_at");

-- CreateIndex
CREATE INDEX "inventory_logs_variant_id_created_at_idx" ON "inventory_logs"("variant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_user_id_status_created_at_idx" ON "orders"("user_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "price_history_variant_id_created_at_idx" ON "price_history"("variant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "products_collection_id_is_active_idx" ON "products"("collection_id", "is_active");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_is_revoked_created_at_idx" ON "refresh_tokens"("user_id", "is_revoked", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_product_id_is_active_is_verified_created_at_idx" ON "reviews"("product_id", "is_active", "is_verified", "created_at" DESC);

-- CreateIndex
CREATE INDEX "users_phone_code_phone_idx" ON "users"("phone_code", "phone");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_status_created_at_idx" ON "wallet_transactions"("wallet_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "wallet_transactions_user_id_created_at_idx" ON "wallet_transactions"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "event_consumer_receipts" ADD CONSTRAINT "event_consumer_receipts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "outbox_events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
