/*
  Warnings:

  - You are about to drop the column `category_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories_translations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "categories_translations" DROP CONSTRAINT "categories_translations_record_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropIndex
DROP INDEX "products_category_id_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category_id",
ADD COLUMN     "collection_id" BIGINT;

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "categories_translations";

-- CreateTable
CREATE TABLE "collections" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections_translations" (
    "id" BIGSERIAL NOT NULL,
    "record_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "collections_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collections_parent_id_idx" ON "collections"("parent_id");

-- CreateIndex
CREATE INDEX "collections_sort_order_idx" ON "collections"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "collections_translations_record_id_lang_id_key" ON "collections_translations"("record_id", "lang_id");

-- CreateIndex
CREATE INDEX "products_collection_id_idx" ON "products"("collection_id");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections_translations" ADD CONSTRAINT "collections_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
