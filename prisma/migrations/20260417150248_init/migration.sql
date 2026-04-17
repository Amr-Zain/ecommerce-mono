-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" BIGINT,
    "user_type" TEXT NOT NULL DEFAULT 'client',
    "guest_token" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "phone_code" TEXT,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "image" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories_translations" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT,
    "has_variants" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_type" TEXT,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "sku" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_translations" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "products_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "hash" TEXT NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "model_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes_translations" (
    "id" BIGSERIAL NOT NULL,
    "attribute_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "attributes_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" BIGSERIAL NOT NULL,
    "attribute_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values_translations" (
    "id" BIGSERIAL NOT NULL,
    "value_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "attribute_values_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "sku" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_attributes" (
    "product_id" BIGINT NOT NULL,
    "product_variant_id" BIGINT NOT NULL,
    "attribute_id" BIGINT NOT NULL,
    "value_id" BIGINT NOT NULL,

    CONSTRAINT "variant_attributes_pkey" PRIMARY KEY ("product_variant_id","attribute_id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages_translations" (
    "id" BIGSERIAL NOT NULL,
    "static_page_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "static_pages_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" BIGSERIAL NOT NULL,
    "static_page_id" BIGINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections_translations" (
    "id" BIGSERIAL NOT NULL,
    "page_section_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,

    CONSTRAINT "page_sections_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sliders" (
    "id" BIGSERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sliders_translations" (
    "id" BIGSERIAL NOT NULL,
    "slider_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "title" TEXT,

    CONSTRAINT "sliders_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" BIGSERIAL NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs_translations" (
    "id" BIGSERIAL NOT NULL,
    "faq_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "faqs_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" BIGSERIAL NOT NULL,
    "phone_code" TEXT NOT NULL,
    "phone_length" INTEGER,
    "shipping_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "phone_start_with" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries_translations" (
    "id" BIGSERIAL NOT NULL,
    "country_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT,
    "short_name" TEXT,
    "currency_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" BIGSERIAL NOT NULL,
    "country_id" BIGINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities_translations" (
    "id" BIGSERIAL NOT NULL,
    "city_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cities_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "address" TEXT NOT NULL,
    "city_id" BIGINT,
    "country_id" BIGINT,
    "street_name" TEXT,
    "building_number" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "address_id" BIGINT,
    "vat_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "variant_id" BIGINT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_value_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_type_snapshot" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items_translations" (
    "id" BIGSERIAL NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name_snapshot" TEXT NOT NULL,
    "description_snapshot" TEXT,

    CONSTRAINT "order_items_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_payments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_type" TEXT,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_guest_token_key" ON "users"("guest_token");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_guest_token_idx" ON "users"("guest_token");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "categories_translations_category_id_lang_id_key" ON "categories_translations"("category_id", "lang_id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_translations_product_id_lang_id_key" ON "products_translations"("product_id", "lang_id");

-- CreateIndex
CREATE INDEX "media_entity_id_model_type_idx" ON "media"("entity_id", "model_type");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_translations_attribute_id_lang_id_key" ON "attributes_translations"("attribute_id", "lang_id");

-- CreateIndex
CREATE INDEX "attribute_values_attribute_id_idx" ON "attribute_values"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_translations_value_id_lang_id_key" ON "attribute_values_translations"("value_id", "lang_id");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "variant_attributes_product_variant_id_idx" ON "variant_attributes"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_attributes_product_id_product_variant_id_attribute__key" ON "variant_attributes"("product_id", "product_variant_id", "attribute_id", "value_id");

-- CreateIndex
CREATE INDEX "product_prices_product_id_idx" ON "product_prices"("product_id");

-- CreateIndex
CREATE INDEX "product_prices_product_id_is_active_idx" ON "product_prices"("product_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_translations_static_page_id_lang_id_key" ON "static_pages_translations"("static_page_id", "lang_id");

-- CreateIndex
CREATE INDEX "page_sections_static_page_id_idx" ON "page_sections"("static_page_id");

-- CreateIndex
CREATE INDEX "page_sections_sort_order_idx" ON "page_sections"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_translations_page_section_id_lang_id_key" ON "page_sections_translations"("page_section_id", "lang_id");

-- CreateIndex
CREATE INDEX "sliders_sort_order_idx" ON "sliders"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "sliders_translations_slider_id_lang_id_key" ON "sliders_translations"("slider_id", "lang_id");

-- CreateIndex
CREATE INDEX "faqs_sort_order_idx" ON "faqs"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_translations_faq_id_lang_id_key" ON "faqs_translations"("faq_id", "lang_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_product_id_key" ON "reviews"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_translations_country_id_lang_id_key" ON "countries_translations"("country_id", "lang_id");

-- CreateIndex
CREATE INDEX "cities_country_id_idx" ON "cities"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_translations_city_id_lang_id_key" ON "cities_translations"("city_id", "lang_id");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "addresses_city_id_idx" ON "addresses"("city_id");

-- CreateIndex
CREATE INDEX "addresses_country_id_idx" ON "addresses"("country_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_address_id_idx" ON "orders"("address_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_variant_id_idx" ON "order_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_translations_order_item_id_lang_id_key" ON "order_items_translations"("order_item_id", "lang_id");

-- CreateIndex
CREATE INDEX "order_payments_order_id_idx" ON "order_payments"("order_id");

-- CreateIndex
CREATE INDEX "order_payments_payment_status_idx" ON "order_payments"("payment_status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY ("role") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_translations" ADD CONSTRAINT "categories_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_translations" ADD CONSTRAINT "products_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes_translations" ADD CONSTRAINT "attributes_translations_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values_translations" ADD CONSTRAINT "attribute_values_translations_value_id_fkey" FOREIGN KEY ("value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_value_id_fkey" FOREIGN KEY ("value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "static_pages_translations" ADD CONSTRAINT "static_pages_translations_static_page_id_fkey" FOREIGN KEY ("static_page_id") REFERENCES "static_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_static_page_id_fkey" FOREIGN KEY ("static_page_id") REFERENCES "static_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections_translations" ADD CONSTRAINT "page_sections_translations_page_section_id_fkey" FOREIGN KEY ("page_section_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sliders_translations" ADD CONSTRAINT "sliders_translations_slider_id_fkey" FOREIGN KEY ("slider_id") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs_translations" ADD CONSTRAINT "faqs_translations_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries_translations" ADD CONSTRAINT "countries_translations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities_translations" ADD CONSTRAINT "cities_translations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_translations" ADD CONSTRAINT "order_items_translations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
