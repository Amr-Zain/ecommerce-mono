/*
  Warnings:

  - You are about to drop the column `barcode` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discount_type` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stock_quantity` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `product_prices` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_product_id_fkey";

-- DropIndex
DROP INDEX "products_barcode_idx";

-- DropIndex
DROP INDEX "products_sku_idx";

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "compare_at_price" DECIMAL(12,2),
ADD COLUMN     "cost_price" DECIMAL(12,2),
ADD COLUMN     "discount_type" TEXT,
ADD COLUMN     "discount_value" DECIMAL(12,2),
ADD COLUMN     "price" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "barcode",
DROP COLUMN "discount_type",
DROP COLUMN "discount_value",
DROP COLUMN "price",
DROP COLUMN "sku",
DROP COLUMN "stock_quantity";

-- DropTable
DROP TABLE "product_prices";

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" BIGSERIAL NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "change_amount" INTEGER NOT NULL,
    "previous_stock" INTEGER NOT NULL,
    "new_stock" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" BIGSERIAL NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "old_price" DECIMAL(12,2) NOT NULL,
    "new_price" DECIMAL(12,2) NOT NULL,
    "old_compare_at_price" DECIMAL(12,2),
    "new_compare_at_price" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_logs_variant_id_idx" ON "inventory_logs"("variant_id");

-- CreateIndex
CREATE INDEX "price_history_variant_id_idx" ON "price_history"("variant_id");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_barcode_idx" ON "product_variants"("barcode");

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
