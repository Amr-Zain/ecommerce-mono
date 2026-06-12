ALTER TABLE "collections" ADD COLUMN "slug" TEXT;
ALTER TABLE "collections_translations" ADD COLUMN "description" TEXT;

UPDATE "collections" AS collection
SET "slug" = COALESCE(
  NULLIF(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(translation."name"), '[^a-z0-9]+', '-', 'g')),
    ''
  ) || '-' || collection."id"::text,
  'collection-' || collection."id"::text
)
FROM "collections_translations" AS translation
WHERE translation."record_id" = collection."id"
  AND translation."lang_id" = 'en'
  AND collection."slug" IS NULL;

UPDATE "collections"
SET "slug" = 'collection-' || "id"::text
WHERE "slug" IS NULL;

ALTER TABLE "collections" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");
CREATE INDEX "product_variants_is_active_price_product_id_idx"
  ON "product_variants"("is_active", "price", "product_id");
CREATE INDEX "variant_attributes_attribute_id_value_id_product_variant_id_idx"
  ON "variant_attributes"("attribute_id", "value_id", "product_variant_id");
