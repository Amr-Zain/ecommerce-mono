/*

users(id, name, email, role(admin,client), user_type(gust, client), gust_token, phone, phone_code, is_phone_verified, is_email_verified, is_active, created_at, updated_at)

addresses(id, user_id, address, city_id, country_id, street_name, building_number, is_default, created_at, updated_at)
countries(id, phone_code, phone_length, shipping_price, is_active, phone_start_with, created_at, updated_at)
countries_translations(id, country_id, lang_id(ar,en), name, nationality, short_name, currency_code, created_at, updated_at)
cities(id, country_id, is_active, created_at, updated_at)
cities_translations(id, city_id, lang_id, name)

categories(id, parent_id, image, sort_order, is_active, created_at, updated_at)
categories_translations(id, category_id, lang_id, name)

products(id, category_id, has_variants, image(media), price, discount_value, discount_type(fixed, percentage), stock_quantity, barcode, sku, is_active, created_at, updated_at)
products_translations(id, product_id, lang_id, name, descriptio)
media(hash, entity_id, model_type(product, category, brand, etc), type(image, video), url)

attributes(id,lang_id(ar,en), name)
attribute_values(id, attribute_id, lang_id(ar,en), name)

product_variants(id, product_id, stock_quantity, barcode, sku, is_active, created_at, updated_at)
variant_attributes((product_id, product_variant_id) composite key, attribute_id, value_id)
reviews(id, user_id, product_id, rating, comment,is_verified, is_active, created_at, updated_at)
product_prices(id, product_id, price, discount_value, discount_type(fixed, percentage), is_active, created_at, updated_at)

orders(id, user_id, address_id,vat_value,vat_type(fixed, percentage),status, payment_method, payment_status, is_active, created_at, updated_at)
order_items(id, order_id, product_id, variant_id, quantity, unit_price_snapshot, discount_value_snapshot, discount_type_snapshot(fixed, percentage), quantity, is_active, created_at, updated_at)
order_items_translations(id, order_item_id, lang_id(ar,en), name_snapshot, description_snapshot)
order_payments(id, order_id, total_price,vat_value,vat_type(fixed, percentage), payment_method, payment_status, is_active, created_at, updated_at)

static_pages(id, slug, is_active, created_at, updated_at)
static_pages_translations(id, static_page_id, lang_id(ar,en), title, content)
page_sections(id, static_page_id, sort_order, is_activeq, created_at, updated_at)
page_sections_translations(id, page_section_id, lang_id(ar,en), title, content)

sliders(id, image, sort_order, start_date, end_date, is_active, created_at, updated_at)
sliders_translations(id, slider_id, lang_id(ar,en), title)

faqs(id, question, answer, sort_order, is_active, created_at, updated_at)
faqs_translations(id, faq_id, lang_id(ar,en), question, answer)


-- PostgreSQL E-commerce Schema
-- =========================================================

-- Optional
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- ENUMS
-- =========================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'client');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
        CREATE TYPE user_type_enum AS ENUM ('guest', 'client');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type_enum') THEN
        CREATE TYPE discount_type_enum AS ENUM ('fixed', 'percentage');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_model_type_enum') THEN
        CREATE TYPE media_model_type_enum AS ENUM (
            'product',
            'category',
            'brand',
            'slider',
            'static_page',
            'page_section'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type_enum') THEN
        CREATE TYPE media_type_enum AS ENUM ('image', 'video');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lang_enum') THEN
        CREATE TYPE lang_enum AS ENUM ('ar', 'en');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM (
            'cash',
            'card',
            'online',
            'wallet',
            'bank_transfer'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM (
            'pending',
            'paid',
            'failed',
            'refunded',
            'partially_refunded'
        );
    END IF;
END$$;

-- =========================================================
-- COMMON UPDATED_AT TRIGGER
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'client',
    user_type user_type_enum NOT NULL DEFAULT 'client',
    guest_token VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    phone_code VARCHAR(10),
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_email_or_guest
        CHECK (
            email IS NOT NULL
            OR guest_token IS NOT NULL
        )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_guest_token ON users(guest_token);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- COUNTRIES / CITIES
-- =========================================================
CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    phone_code VARCHAR(10) NOT NULL,
    phone_length INT,
    shipping_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone_start_with VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE countries_translations (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(255),
    short_name VARCHAR(50),
    currency_code VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, lang_id)
);

CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cities_translations (
    id BIGSERIAL PRIMARY KEY,
    city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE (city_id, lang_id)
);

CREATE INDEX idx_cities_country_id ON cities(country_id);

CREATE TRIGGER trg_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cities_updated_at
BEFORE UPDATE ON cities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- ADDRESSES
-- =========================================================
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city_id BIGINT REFERENCES cities(id) ON DELETE SET NULL,
    country_id BIGINT REFERENCES countries(id) ON DELETE SET NULL,
    street_name VARCHAR(255),
    building_number VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_city_id ON addresses(city_id);
CREATE INDEX idx_addresses_country_id ON addresses(country_id);

CREATE TRIGGER trg_addresses_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- optional: only one default address per user
CREATE UNIQUE INDEX uq_addresses_one_default_per_user
ON addresses(user_id)
WHERE is_default = TRUE;

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    image TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories_translations (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE (category_id, lang_id)
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PRODUCTS
-- =========================================================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    has_variants BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type discount_type_enum,
    stock_quantity INT NOT NULL DEFAULT 0,
    barcode VARCHAR(100),
    sku VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_products_stock_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_discount_value CHECK (discount_value >= 0)
);

CREATE TABLE products_translations (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE (product_id, lang_id)
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- MEDIA
-- =========================================================
CREATE TABLE media (
    hash VARCHAR(255) PRIMARY KEY,
    entity_id BIGINT NOT NULL,
    model_type media_model_type_enum NOT NULL,
    type media_type_enum NOT NULL,
    url TEXT NOT NULL
);

CREATE INDEX idx_media_entity_model ON media(entity_id, model_type);

-- =========================================================
-- ATTRIBUTES / ATTRIBUTE VALUES (normalized)
-- =========================================================
CREATE TABLE attributes (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attributes_translations (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE (attribute_id, lang_id)
);

CREATE TABLE attribute_values (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attribute_values_translations (
    id BIGSERIAL PRIMARY KEY,
    value_id BIGINT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE (value_id, lang_id)
);

CREATE INDEX idx_attribute_values_attribute_id ON attribute_values(attribute_id);

-- =========================================================
-- PRODUCT VARIANTS
-- =========================================================
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    barcode VARCHAR(100),
    sku VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_product_variants_stock_quantity CHECK (stock_quantity >= 0)
);

CREATE TABLE variant_attributes (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    value_id BIGINT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (product_variant_id, attribute_id),
    UNIQUE (product_id, product_variant_id, attribute_id, value_id)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variant_attributes_variant_id ON variant_attributes(product_variant_id);

CREATE TRIGGER trg_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- REVIEWS
-- =========================================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL,
    comment TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- optional: one review per user per product
CREATE UNIQUE INDEX uq_reviews_user_product
ON reviews(user_id, product_id);

-- =========================================================
-- PRODUCT PRICES
-- =========================================================
CREATE TABLE product_prices (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price NUMERIC(12,2) NOT NULL,
    discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type discount_type_enum,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_product_prices_price CHECK (price >= 0),
    CONSTRAINT chk_product_prices_discount_value CHECK (discount_value >= 0)
);

CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_product_prices_active ON product_prices(product_id, is_active);

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    address_id BIGINT REFERENCES addresses(id) ON DELETE SET NULL,
    vat_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    vat_type discount_type_enum,
    status order_status_enum NOT NULL DEFAULT 'pending',
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_orders_vat_value CHECK (vat_value >= 0)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_address_id ON orders(address_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- ORDER ITEMS
-- =========================================================
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_value_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type_snapshot discount_type_enum,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price_snapshot >= 0),
    CONSTRAINT chk_order_items_discount CHECK (discount_value_snapshot >= 0)
);

CREATE TABLE order_items_translations (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    name_snapshot VARCHAR(255) NOT NULL,
    description_snapshot TEXT,
    UNIQUE (order_item_id, lang_id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);

-- =========================================================
-- ORDER PAYMENTS
-- =========================================================
CREATE TABLE order_payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    vat_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    vat_type discount_type_enum,
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_order_payments_total_price CHECK (total_price >= 0),
    CONSTRAINT chk_order_payments_vat_value CHECK (vat_value >= 0)
);

CREATE INDEX idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX idx_order_payments_payment_status ON order_payments(payment_status);

-- =========================================================
-- STATIC PAGES
-- =========================================================
CREATE TABLE static_pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE static_pages_translations (
    id BIGSERIAL PRIMARY KEY,
    static_page_id BIGINT NOT NULL REFERENCES static_pages(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    UNIQUE (static_page_id, lang_id)
);

CREATE TRIGGER trg_static_pages_updated_at
BEFORE UPDATE ON static_pages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PAGE SECTIONS
-- =========================================================
CREATE TABLE page_sections (
    id BIGSERIAL PRIMARY KEY,
    static_page_id BIGINT NOT NULL REFERENCES static_pages(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE page_sections_translations (
    id BIGSERIAL PRIMARY KEY,
    page_section_id BIGINT NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    title VARCHAR(255),
    content TEXT,
    UNIQUE (page_section_id, lang_id)
);

CREATE INDEX idx_page_sections_static_page_id ON page_sections(static_page_id);
CREATE INDEX idx_page_sections_sort_order ON page_sections(sort_order);

CREATE TRIGGER trg_page_sections_updated_at
BEFORE UPDATE ON page_sections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- SLIDERS
-- =========================================================
CREATE TABLE sliders (
    id BIGSERIAL PRIMARY KEY,
    image TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_sliders_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE sliders_translations (
    id BIGSERIAL PRIMARY KEY,
    slider_id BIGINT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    title VARCHAR(255),
    UNIQUE (slider_id, lang_id)
);

CREATE INDEX idx_sliders_sort_order ON sliders(sort_order);

CREATE TRIGGER trg_sliders_updated_at
BEFORE UPDATE ON sliders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- FAQS
-- =========================================================
CREATE TABLE faqs (
    id BIGSERIAL PRIMARY KEY,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE faqs_translations (
    id BIGSERIAL PRIMARY KEY,
    faq_id BIGINT NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
    lang_id lang_enum NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    UNIQUE (faq_id, lang_id)
);

CREATE INDEX idx_faqs_sort_order ON faqs(sort_order);

CREATE TRIGGER trg_faqs_updated_at
BEFORE UPDATE ON faqs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
*/
