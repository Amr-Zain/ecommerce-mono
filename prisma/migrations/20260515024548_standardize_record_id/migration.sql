/*
  Warnings:

  - You are about to drop the column `value_id` on the `attribute_values_translations` table. All the data in the column will be lost.
  - You are about to drop the column `attribute_id` on the `attributes_translations` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `categories_translations` table. All the data in the column will be lost.
  - You are about to drop the column `city_id` on the `cities_translations` table. All the data in the column will be lost.
  - You are about to drop the column `country_id` on the `countries_translations` table. All the data in the column will be lost.
  - You are about to drop the column `faq_id` on the `faqs_translations` table. All the data in the column will be lost.
  - You are about to drop the column `order_item_id` on the `order_items_translations` table. All the data in the column will be lost.
  - You are about to drop the column `page_section_id` on the `page_sections_translations` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `products_translations` table. All the data in the column will be lost.
  - You are about to drop the column `slider_id` on the `sliders_translations` table. All the data in the column will be lost.
  - You are about to drop the column `static_page_id` on the `static_pages_translations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `attribute_values_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `attributes_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `categories_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `cities_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `countries_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `faqs_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `order_items_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `page_sections_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `products_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `sliders_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[record_id,lang_id]` on the table `static_pages_translations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `record_id` to the `attribute_values_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `attributes_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `categories_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `cities_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `countries_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `faqs_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `order_items_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `page_sections_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `products_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `sliders_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `static_pages_translations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attribute_values_translations" DROP CONSTRAINT "attribute_values_translations_value_id_fkey";

-- DropForeignKey
ALTER TABLE "attributes_translations" DROP CONSTRAINT "attributes_translations_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "categories_translations" DROP CONSTRAINT "categories_translations_category_id_fkey";

-- DropForeignKey
ALTER TABLE "cities_translations" DROP CONSTRAINT "cities_translations_city_id_fkey";

-- DropForeignKey
ALTER TABLE "countries_translations" DROP CONSTRAINT "countries_translations_country_id_fkey";

-- DropForeignKey
ALTER TABLE "faqs_translations" DROP CONSTRAINT "faqs_translations_faq_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items_translations" DROP CONSTRAINT "order_items_translations_order_item_id_fkey";

-- DropForeignKey
ALTER TABLE "page_sections_translations" DROP CONSTRAINT "page_sections_translations_page_section_id_fkey";

-- DropForeignKey
ALTER TABLE "products_translations" DROP CONSTRAINT "products_translations_product_id_fkey";

-- DropForeignKey
ALTER TABLE "sliders_translations" DROP CONSTRAINT "sliders_translations_slider_id_fkey";

-- DropForeignKey
ALTER TABLE "static_pages_translations" DROP CONSTRAINT "static_pages_translations_static_page_id_fkey";

-- DropIndex
DROP INDEX "attribute_values_translations_value_id_lang_id_key";

-- DropIndex
DROP INDEX "attributes_translations_attribute_id_lang_id_key";

-- DropIndex
DROP INDEX "categories_translations_category_id_lang_id_key";

-- DropIndex
DROP INDEX "cities_translations_city_id_lang_id_key";

-- DropIndex
DROP INDEX "countries_translations_country_id_lang_id_key";

-- DropIndex
DROP INDEX "faqs_translations_faq_id_lang_id_key";

-- DropIndex
DROP INDEX "order_items_translations_order_item_id_lang_id_key";

-- DropIndex
DROP INDEX "page_sections_translations_page_section_id_lang_id_key";

-- DropIndex
DROP INDEX "products_translations_product_id_lang_id_key";

-- DropIndex
DROP INDEX "sliders_translations_slider_id_lang_id_key";

-- DropIndex
DROP INDEX "static_pages_translations_static_page_id_lang_id_key";

-- AlterTable
ALTER TABLE "attribute_values_translations" DROP COLUMN "value_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "attributes_translations" DROP COLUMN "attribute_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "categories_translations" DROP COLUMN "category_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "cities_translations" DROP COLUMN "city_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "countries_translations" DROP COLUMN "country_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "faqs_translations" DROP COLUMN "faq_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "order_items_translations" DROP COLUMN "order_item_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "page_sections_translations" DROP COLUMN "page_section_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "products_translations" DROP COLUMN "product_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "sliders_translations" DROP COLUMN "slider_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "static_pages_translations" DROP COLUMN "static_page_id",
ADD COLUMN     "record_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_translations_record_id_lang_id_key" ON "attribute_values_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_translations_record_id_lang_id_key" ON "attributes_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_translations_record_id_lang_id_key" ON "categories_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_translations_record_id_lang_id_key" ON "cities_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_translations_record_id_lang_id_key" ON "countries_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_translations_record_id_lang_id_key" ON "faqs_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_translations_record_id_lang_id_key" ON "order_items_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_translations_record_id_lang_id_key" ON "page_sections_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_translations_record_id_lang_id_key" ON "products_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "sliders_translations_record_id_lang_id_key" ON "sliders_translations"("record_id", "lang_id");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_translations_record_id_lang_id_key" ON "static_pages_translations"("record_id", "lang_id");

-- AddForeignKey
ALTER TABLE "categories_translations" ADD CONSTRAINT "categories_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_translations" ADD CONSTRAINT "products_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes_translations" ADD CONSTRAINT "attributes_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values_translations" ADD CONSTRAINT "attribute_values_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "static_pages_translations" ADD CONSTRAINT "static_pages_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "static_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections_translations" ADD CONSTRAINT "page_sections_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sliders_translations" ADD CONSTRAINT "sliders_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs_translations" ADD CONSTRAINT "faqs_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries_translations" ADD CONSTRAINT "countries_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities_translations" ADD CONSTRAINT "cities_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_translations" ADD CONSTRAINT "order_items_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
