/*
  Warnings:

  - You are about to drop the column `name_ar` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `name_en` on the `roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "roles" DROP COLUMN "name_ar",
DROP COLUMN "name_en";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "name" SET DEFAULT 'guest',
ALTER COLUMN "user_type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "roles_translations" (
    "id" BIGSERIAL NOT NULL,
    "record_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_translations_record_id_lang_id_key" ON "roles_translations"("record_id", "lang_id");

-- AddForeignKey
ALTER TABLE "roles_translations" ADD CONSTRAINT "roles_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
