-- DropForeignKey
ALTER TABLE "order_payments" DROP CONSTRAINT "order_payments_order_id_fkey";

-- DropIndex
DROP INDEX "product_variants_barcode_idx";

-- DropIndex
DROP INDEX "product_variants_sku_idx";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "image_snapshot" TEXT,
ADD COLUMN     "product_name_snapshot" TEXT NOT NULL,
ADD COLUMN     "total_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "variant_info_snapshot" JSONB;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "city_name_snapshot" TEXT,
ADD COLUMN     "country_id" BIGINT,
ADD COLUMN     "country_name_snapshot" TEXT,
ADD COLUMN     "coupon_code_snapshot" TEXT,
ADD COLUMN     "coupon_id" BIGINT,
ADD COLUMN     "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "order_number" TEXT NOT NULL,
ADD COLUMN     "shipping_address_snapshot" JSONB,
ADD COLUMN     "shipping_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_price" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wishlist_items" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "order_payments";

-- CreateTable
CREATE TABLE "carts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_id" BIGINT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "transaction_ref" TEXT,
    "gateway_response" JSONB,
    "paid_at" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_checkouts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "address_id" BIGINT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "transaction_ref" TEXT,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "coupon_code" TEXT,
    "notes" TEXT,
    "lang_id" TEXT NOT NULL DEFAULT 'en',
    "checkout_snapshot" JSONB NOT NULL,
    "gateway_response" JSONB,
    "order_id" BIGINT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_reservations" (
    "id" BIGSERIAL NOT NULL,
    "pending_checkout_id" BIGINT NOT NULL,
    "coupon_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" BIGSERIAL NOT NULL,
    "pending_checkout_id" BIGINT NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "min_order_amount" DECIMAL(12,2),
    "max_discount" DECIMAL(12,2),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_key" ON "cart_items"("cart_id", "product_id", "variant_id");

-- CreateIndex
CREATE INDEX "payment_transactions_order_id_idx" ON "payment_transactions"("order_id");

-- CreateIndex
CREATE INDEX "payment_transactions_payment_status_idx" ON "payment_transactions"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "pending_checkouts_transaction_ref_key" ON "pending_checkouts"("transaction_ref");

-- CreateIndex
CREATE INDEX "pending_checkouts_user_id_idx" ON "pending_checkouts"("user_id");

-- CreateIndex
CREATE INDEX "pending_checkouts_payment_status_idx" ON "pending_checkouts"("payment_status");

-- CreateIndex
CREATE INDEX "pending_checkouts_transaction_ref_idx" ON "pending_checkouts"("transaction_ref");

-- CreateIndex
CREATE INDEX "coupon_reservations_pending_checkout_id_idx" ON "coupon_reservations"("pending_checkout_id");

-- CreateIndex
CREATE INDEX "coupon_reservations_coupon_id_idx" ON "coupon_reservations"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_reservations_user_id_idx" ON "coupon_reservations"("user_id");

-- CreateIndex
CREATE INDEX "coupon_reservations_status_idx" ON "coupon_reservations"("status");

-- CreateIndex
CREATE INDEX "coupon_reservations_expires_at_idx" ON "coupon_reservations"("expires_at");

-- CreateIndex
CREATE INDEX "stock_reservations_pending_checkout_id_idx" ON "stock_reservations"("pending_checkout_id");

-- CreateIndex
CREATE INDEX "stock_reservations_variant_id_idx" ON "stock_reservations"("variant_id");

-- CreateIndex
CREATE INDEX "stock_reservations_status_idx" ON "stock_reservations"("status");

-- CreateIndex
CREATE INDEX "stock_reservations_expires_at_idx" ON "stock_reservations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "product_variants"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_reservations" ADD CONSTRAINT "coupon_reservations_pending_checkout_id_fkey" FOREIGN KEY ("pending_checkout_id") REFERENCES "pending_checkouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_reservations" ADD CONSTRAINT "coupon_reservations_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_pending_checkout_id_fkey" FOREIGN KEY ("pending_checkout_id") REFERENCES "pending_checkouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
