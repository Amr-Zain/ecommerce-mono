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



*/
