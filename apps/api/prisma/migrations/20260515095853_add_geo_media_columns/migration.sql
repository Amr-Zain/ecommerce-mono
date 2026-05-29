/*
  Warnings:

  - A unique constraint covering the columns `[model,id]` on the table `cities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,id]` on the table `countries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'city';

-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'country';

-- CreateIndex
CREATE UNIQUE INDEX "cities_model_id_key" ON "cities"("model", "id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_model_id_key" ON "countries"("model", "id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_country_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "countries"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_city_fkey" FOREIGN KEY ("model", "model_id") REFERENCES "cities"("model", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
