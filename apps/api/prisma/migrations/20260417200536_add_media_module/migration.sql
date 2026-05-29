/*
  Warnings:

  - You are about to drop the column `image` on the `categories` table. All the data in the column will be lost.
  - The primary key for the `media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `entity_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `model_type` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `sliders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `extension` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `media` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `media` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "media_entity_id_model_type_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "image",
ADD COLUMN     "image_id" BIGINT;

-- AlterTable
ALTER TABLE "media" DROP CONSTRAINT "media_pkey",
DROP COLUMN "entity_id",
DROP COLUMN "hash",
DROP COLUMN "model_type",
DROP COLUMN "url",
ADD COLUMN     "attach_hash" TEXT,
ADD COLUMN     "collection" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "extension" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "model_id" TEXT,
ADD COLUMN     "original_name" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uuid" UUID NOT NULL,
ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "products" DROP COLUMN "image",
ADD COLUMN     "image_id" BIGINT;

-- AlterTable
ALTER TABLE "sliders" DROP COLUMN "image",
ADD COLUMN     "image_id" BIGINT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image_id" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "media_uuid_key" ON "media"("uuid");

-- CreateIndex
CREATE INDEX "media_uuid_idx" ON "media"("uuid");

-- CreateIndex
CREATE INDEX "media_model_model_id_idx" ON "media"("model", "model_id");

-- CreateIndex
CREATE INDEX "media_model_model_id_collection_idx" ON "media"("model", "model_id", "collection");

-- CreateIndex
CREATE INDEX "media_model_attach_hash_idx" ON "media"("model", "attach_hash");

-- CreateIndex
CREATE INDEX "media_type_idx" ON "media"("type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sliders" ADD CONSTRAINT "sliders_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
