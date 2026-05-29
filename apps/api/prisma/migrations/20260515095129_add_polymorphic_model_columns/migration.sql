/*
  Warnings:

  - You are about to drop the column `image_id` on the `categories` table. All the data in the column will be lost.
  - The `model_id` column on the `media` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `image_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image_id` on the `sliders` table. All the data in the column will be lost.
  - You are about to drop the column `image_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[model,id]` on the table `attributes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `faqs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `page_sections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `sliders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `static_pages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_image_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_image_id_fkey";

-- DropForeignKey
ALTER TABLE "sliders" DROP CONSTRAINT "sliders_image_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_image_id_fkey";

-- AlterTable
ALTER TABLE "attributes" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'attribute';

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "image_id",
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'category';

-- AlterTable
ALTER TABLE "faqs" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'faq';

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "is_main" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "model_id",
ADD COLUMN     "model_id" BIGINT;

-- AlterTable
ALTER TABLE "page_sections" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'page_section';

-- AlterTable
ALTER TABLE "products" DROP COLUMN "image_id",
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'product';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'review';

-- AlterTable
ALTER TABLE "sliders" DROP COLUMN "image_id",
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'slider';

-- AlterTable
ALTER TABLE "static_pages" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'static_page';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image_id",
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX "attributes_model_id_key" ON "attributes"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_model_id_key" ON "categories"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_model_id_key" ON "faqs"("model", "id");

-- CreateIndex
CREATE INDEX "media_model_model_id_idx" ON "media"("model", "model_id");

-- CreateIndex
CREATE INDEX "media_model_model_id_collection_idx" ON "media"("model", "model_id", "collection");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_model_id_key" ON "page_sections"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "products_model_id_key" ON "products"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_model_id_key" ON "reviews"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "sliders_model_id_key" ON "sliders"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_model_id_key" ON "static_pages"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "users_model_id_key" ON "users"("model", "id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_category_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "categories"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_product_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "products"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_attribute_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "attributes"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_static_page_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "static_pages"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_page_section_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "page_sections"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_slider_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "sliders"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_faq_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "faqs"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_review_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "reviews"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "users"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
