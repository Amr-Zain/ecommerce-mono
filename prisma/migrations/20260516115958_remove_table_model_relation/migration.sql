/*
  Warnings:

  - You are about to drop the column `model` on the `attributes` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `countries` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `faqs` table. All the data in the column will be lost.
  - You are about to drop the column `attribute_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `city_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `country_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `faq_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `page_section_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `review_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `slider_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `static_page_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `page_sections` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `sliders` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `static_pages` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `users` table. All the data in the column will be lost.
  - Made the column `collection` on table `media` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_category_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_city_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_country_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_faq_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_page_section_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_product_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_review_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_slider_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_static_page_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_user_id_fkey";

-- DropIndex
DROP INDEX "attributes_model_id_key";

-- DropIndex
DROP INDEX "categories_model_id_key";

-- DropIndex
DROP INDEX "cities_model_id_key";

-- DropIndex
DROP INDEX "countries_model_id_key";

-- DropIndex
DROP INDEX "faqs_model_id_key";

-- DropIndex
DROP INDEX "media_type_idx";

-- DropIndex
DROP INDEX "page_sections_model_id_key";

-- DropIndex
DROP INDEX "products_model_id_key";

-- DropIndex
DROP INDEX "reviews_model_id_key";

-- DropIndex
DROP INDEX "sliders_model_id_key";

-- DropIndex
DROP INDEX "static_pages_model_id_key";

-- DropIndex
DROP INDEX "users_model_id_key";

-- AlterTable
ALTER TABLE "attributes" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "cities" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "countries" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "faqs" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "attribute_id",
DROP COLUMN "category_id",
DROP COLUMN "city_id",
DROP COLUMN "country_id",
DROP COLUMN "faq_id",
DROP COLUMN "page_section_id",
DROP COLUMN "product_id",
DROP COLUMN "review_id",
DROP COLUMN "slider_id",
DROP COLUMN "static_page_id",
DROP COLUMN "user_id",
ALTER COLUMN "collection" SET NOT NULL,
ALTER COLUMN "collection" SET DEFAULT 'default';

-- AlterTable
ALTER TABLE "page_sections" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "sliders" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "static_pages" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "model";

-- CreateIndex
CREATE INDEX "media_collection_idx" ON "media"("collection");
