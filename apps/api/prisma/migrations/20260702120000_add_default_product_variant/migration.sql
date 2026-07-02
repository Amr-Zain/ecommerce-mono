-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- Backfill one default per product, preferring active in-stock cheapest variants.
WITH ranked_variants AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY product_id
      ORDER BY
        CASE WHEN is_active AND stock_quantity > 0 THEN 0 ELSE 1 END,
        CASE WHEN is_active THEN 0 ELSE 1 END,
        price ASC,
        id ASC
    ) AS rn
  FROM "product_variants"
)
UPDATE "product_variants" pv
SET "is_default" = true
FROM ranked_variants rv
WHERE pv.id = rv.id AND rv.rn = 1;

-- CreateIndex
CREATE INDEX "product_variants_product_id_is_default_idx" ON "product_variants"("product_id", "is_default");

-- Enforce a single manual default variant per product.
CREATE UNIQUE INDEX "product_variants_one_default_per_product"
ON "product_variants"("product_id")
WHERE "is_default" = true;
