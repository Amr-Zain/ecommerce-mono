-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_attribute_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_category_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_city_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_country_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_faq_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_page_section_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_product_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_review_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_slider_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_static_page_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_user_fkey";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "attribute_id" BIGINT,
ADD COLUMN     "category_id" BIGINT,
ADD COLUMN     "city_id" BIGINT,
ADD COLUMN     "country_id" BIGINT,
ADD COLUMN     "faq_id" BIGINT,
ADD COLUMN     "page_section_id" BIGINT,
ADD COLUMN     "product_id" BIGINT,
ADD COLUMN     "review_id" BIGINT,
ADD COLUMN     "slider_id" BIGINT,
ADD COLUMN     "static_page_id" BIGINT,
ADD COLUMN     "user_id" BIGINT;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_static_page_id_fkey" FOREIGN KEY ("static_page_id") REFERENCES "static_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_page_section_id_fkey" FOREIGN KEY ("page_section_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_slider_id_fkey" FOREIGN KEY ("slider_id") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
