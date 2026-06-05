-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "coupon_discount_share" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "line_subtotal_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "net_line_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "net_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vat_share" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivered_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "return_requests" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "old_variant_id" BIGINT,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "return_reason" TEXT NOT NULL,
    "client_note" TEXT,
    "admin_note" TEXT,
    "old_unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "old_net_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "refund_status" TEXT NOT NULL DEFAULT 'none',
    "item_disposition" TEXT NOT NULL DEFAULT 'restock',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "item_received_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_requests" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "old_variant_id" BIGINT,
    "new_variant_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "price_adjustment_status" TEXT NOT NULL DEFAULT 'none',
    "exchange_reason" TEXT NOT NULL,
    "client_note" TEXT,
    "admin_note" TEXT,
    "old_unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "old_net_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "new_unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "old_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "new_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "price_difference" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "item_disposition" TEXT NOT NULL DEFAULT 'restock',
    "replacement_reserved_at" TIMESTAMP(3),
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "item_received_at" TIMESTAMP(3),
    "replacement_shipped_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_requests_order_id_idx" ON "return_requests"("order_id");

-- CreateIndex
CREATE INDEX "return_requests_order_item_id_idx" ON "return_requests"("order_item_id");

-- CreateIndex
CREATE INDEX "return_requests_user_id_idx" ON "return_requests"("user_id");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

-- CreateIndex
CREATE INDEX "exchange_requests_order_id_idx" ON "exchange_requests"("order_id");

-- CreateIndex
CREATE INDEX "exchange_requests_order_item_id_idx" ON "exchange_requests"("order_item_id");

-- CreateIndex
CREATE INDEX "exchange_requests_user_id_idx" ON "exchange_requests"("user_id");

-- CreateIndex
CREATE INDEX "exchange_requests_status_idx" ON "exchange_requests"("status");

-- CreateIndex
CREATE INDEX "exchange_requests_price_adjustment_status_idx" ON "exchange_requests"("price_adjustment_status");

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_old_variant_id_fkey" FOREIGN KEY ("old_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_old_variant_id_fkey" FOREIGN KEY ("old_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_new_variant_id_fkey" FOREIGN KEY ("new_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
