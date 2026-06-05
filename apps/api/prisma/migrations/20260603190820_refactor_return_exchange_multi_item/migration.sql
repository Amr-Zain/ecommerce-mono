/*
  Warnings:

  - You are about to drop the column `exchange_reason` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `item_disposition` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `new_unit_price_snapshot` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `new_value` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `new_variant_id` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_net_unit_price` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_unit_price_snapshot` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_value` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_variant_id` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `order_item_id` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `price_difference` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `exchange_requests` table. All the data in the column will be lost.
  - You are about to drop the column `item_disposition` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_net_unit_price` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_unit_price_snapshot` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `old_variant_id` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `order_item_id` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `refund_amount` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `return_reason` on the `return_requests` table. All the data in the column will be lost.
  - You are about to drop the column `vat_refund_amount` on the `return_requests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "exchange_requests" DROP CONSTRAINT "exchange_requests_new_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "exchange_requests" DROP CONSTRAINT "exchange_requests_old_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "exchange_requests" DROP CONSTRAINT "exchange_requests_order_item_id_fkey";

-- DropForeignKey
ALTER TABLE "return_requests" DROP CONSTRAINT "return_requests_old_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "return_requests" DROP CONSTRAINT "return_requests_order_item_id_fkey";

-- DropIndex
DROP INDEX "exchange_requests_order_item_id_idx";

-- DropIndex
DROP INDEX "return_requests_order_item_id_idx";

-- AlterTable
ALTER TABLE "exchange_requests" DROP COLUMN "exchange_reason",
DROP COLUMN "item_disposition",
DROP COLUMN "new_unit_price_snapshot",
DROP COLUMN "new_value",
DROP COLUMN "new_variant_id",
DROP COLUMN "old_net_unit_price",
DROP COLUMN "old_unit_price_snapshot",
DROP COLUMN "old_value",
DROP COLUMN "old_variant_id",
DROP COLUMN "order_item_id",
DROP COLUMN "price_difference",
DROP COLUMN "quantity",
ADD COLUMN     "replacement_shipping_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "settlement_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shipping_fee_reason" TEXT,
ADD COLUMN     "suggested_replacement_shipping_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_new_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_old_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_price_difference" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "return_requests" DROP COLUMN "item_disposition",
DROP COLUMN "old_net_unit_price",
DROP COLUMN "old_unit_price_snapshot",
DROP COLUMN "old_variant_id",
DROP COLUMN "order_item_id",
DROP COLUMN "quantity",
DROP COLUMN "refund_amount",
DROP COLUMN "return_reason",
DROP COLUMN "vat_refund_amount",
ADD COLUMN     "adjusted_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "adjusted_vat_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "calculated_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "calculated_vat_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "final_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "max_shipping_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "refund_adjustment_reason" TEXT,
ADD COLUMN     "shipping_refund_reason" TEXT,
ADD COLUMN     "suggested_shipping_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "return_request_items" (
    "id" BIGSERIAL NOT NULL,
    "return_request_id" BIGINT NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "old_variant_id" BIGINT,
    "quantity" INTEGER NOT NULL,
    "accepted_quantity" INTEGER NOT NULL DEFAULT 0,
    "return_reason" TEXT NOT NULL,
    "client_note" TEXT,
    "admin_note" TEXT,
    "item_disposition" TEXT NOT NULL DEFAULT 'restock',
    "old_unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "old_net_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "calculated_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "calculated_vat_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adjusted_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adjusted_vat_refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "refund_adjustment_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_request_items" (
    "id" BIGSERIAL NOT NULL,
    "exchange_request_id" BIGINT NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "old_variant_id" BIGINT,
    "new_variant_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "accepted_quantity" INTEGER NOT NULL DEFAULT 0,
    "exchange_reason" TEXT NOT NULL,
    "client_note" TEXT,
    "admin_note" TEXT,
    "item_disposition" TEXT NOT NULL DEFAULT 'restock',
    "old_unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "old_net_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "new_unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "old_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "new_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "price_difference" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_request_items_return_request_id_idx" ON "return_request_items"("return_request_id");

-- CreateIndex
CREATE INDEX "return_request_items_order_item_id_idx" ON "return_request_items"("order_item_id");

-- CreateIndex
CREATE INDEX "return_request_items_old_variant_id_idx" ON "return_request_items"("old_variant_id");

-- CreateIndex
CREATE INDEX "exchange_request_items_exchange_request_id_idx" ON "exchange_request_items"("exchange_request_id");

-- CreateIndex
CREATE INDEX "exchange_request_items_order_item_id_idx" ON "exchange_request_items"("order_item_id");

-- CreateIndex
CREATE INDEX "exchange_request_items_old_variant_id_idx" ON "exchange_request_items"("old_variant_id");

-- CreateIndex
CREATE INDEX "exchange_request_items_new_variant_id_idx" ON "exchange_request_items"("new_variant_id");

-- AddForeignKey
ALTER TABLE "return_request_items" ADD CONSTRAINT "return_request_items_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_items" ADD CONSTRAINT "return_request_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_items" ADD CONSTRAINT "return_request_items_old_variant_id_fkey" FOREIGN KEY ("old_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_request_items" ADD CONSTRAINT "exchange_request_items_exchange_request_id_fkey" FOREIGN KEY ("exchange_request_id") REFERENCES "exchange_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_request_items" ADD CONSTRAINT "exchange_request_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_request_items" ADD CONSTRAINT "exchange_request_items_old_variant_id_fkey" FOREIGN KEY ("old_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_request_items" ADD CONSTRAINT "exchange_request_items_new_variant_id_fkey" FOREIGN KEY ("new_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
