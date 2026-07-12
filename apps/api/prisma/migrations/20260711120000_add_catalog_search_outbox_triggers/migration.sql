CREATE OR REPLACE FUNCTION catalog_enqueue_change(payload JSONB, aggregate_type TEXT, aggregate_id TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO outbox_events (
    event_id, event_name, version, aggregate_type, aggregate_id, payload, occurred_at,
    status, attempts, available_at, created_at
  ) VALUES (
    gen_random_uuid()::text, 'catalog.entity_changed', 1, aggregate_type, aggregate_id,
    payload, NOW(), 'pending', 0, NOW(), NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_product_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; product_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  product_id := row_data.id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'product', 'entityId', product_id, 'productId', product_id),
    'product', product_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_product_translation_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; product_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  product_id := row_data.record_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'product', 'entityId', product_id, 'productId', product_id),
    'product', product_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_variant_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; product_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  product_id := row_data.product_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'product', 'entityId', row_data.id::text, 'productId', product_id),
    'product', product_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_variant_attribute_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; product_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  product_id := row_data.product_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'product', 'entityId', row_data.product_variant_id::text, 'productId', product_id),
    'product', product_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_collection_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; collection_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  collection_id := row_data.id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'collection', 'entityId', collection_id, 'collectionId', collection_id),
    'collection', collection_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_collection_translation_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; collection_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  collection_id := row_data.record_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'collection', 'entityId', collection_id, 'collectionId', collection_id),
    'collection', collection_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_attribute_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; attribute_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  attribute_id := row_data.id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'attribute', 'entityId', attribute_id, 'attributeId', attribute_id),
    'attribute', attribute_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_attribute_translation_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; attribute_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  attribute_id := row_data.record_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'attribute', 'entityId', attribute_id, 'attributeId', attribute_id),
    'attribute', attribute_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_attribute_value_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; attribute_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  attribute_id := row_data.attribute_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'attribute', 'entityId', row_data.id::text, 'attributeId', attribute_id),
    'attribute', attribute_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_attribute_value_translation_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; attribute_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  SELECT attribute_id::text INTO attribute_id FROM attribute_values WHERE id = row_data.record_id;
  IF attribute_id IS NOT NULL THEN
    PERFORM catalog_enqueue_change(
      jsonb_build_object('entity', 'attribute', 'entityId', row_data.record_id::text, 'attributeId', attribute_id),
      'attribute', attribute_id
    );
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_review_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; product_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  product_id := row_data.product_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'review', 'entityId', row_data.id::text, 'productId', product_id),
    'product', product_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_media_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  IF row_data.model IN ('product', 'productvariant', 'collection') AND row_data.model_id IS NOT NULL THEN
    PERFORM catalog_enqueue_change(
      jsonb_build_object('entity', 'media', 'entityId', row_data.id::text, 'model', row_data.model, 'modelId', row_data.model_id::text),
      row_data.model, row_data.model_id::text
    );
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_order_changed() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.payment_status IS DISTINCT FROM NEW.payment_status OR OLD.delivered_at IS DISTINCT FROM NEW.delivered_at THEN
    PERFORM catalog_enqueue_change(
      jsonb_build_object('entity', 'order', 'entityId', NEW.id::text, 'orderId', NEW.id::text),
      'order', NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION catalog_order_item_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; order_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  order_id := row_data.order_id::text;
  PERFORM catalog_enqueue_change(
    jsonb_build_object('entity', 'order', 'entityId', order_id, 'orderId', order_id),
    'order', order_id
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER search_products_changed AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION catalog_product_changed();
CREATE TRIGGER search_product_translations_changed AFTER INSERT OR UPDATE OR DELETE ON products_translations FOR EACH ROW EXECUTE FUNCTION catalog_product_translation_changed();
CREATE TRIGGER search_product_variants_changed AFTER INSERT OR UPDATE OR DELETE ON product_variants FOR EACH ROW EXECUTE FUNCTION catalog_variant_changed();
CREATE TRIGGER search_variant_attributes_changed AFTER INSERT OR UPDATE OR DELETE ON variant_attributes FOR EACH ROW EXECUTE FUNCTION catalog_variant_attribute_changed();
CREATE TRIGGER search_collections_changed AFTER INSERT OR UPDATE OR DELETE ON collections FOR EACH ROW EXECUTE FUNCTION catalog_collection_changed();
CREATE TRIGGER search_collection_translations_changed AFTER INSERT OR UPDATE OR DELETE ON collections_translations FOR EACH ROW EXECUTE FUNCTION catalog_collection_translation_changed();
CREATE TRIGGER search_attributes_changed AFTER INSERT OR UPDATE OR DELETE ON attributes FOR EACH ROW EXECUTE FUNCTION catalog_attribute_changed();
CREATE TRIGGER search_attribute_translations_changed AFTER INSERT OR UPDATE OR DELETE ON attributes_translations FOR EACH ROW EXECUTE FUNCTION catalog_attribute_translation_changed();
CREATE TRIGGER search_attribute_values_changed AFTER INSERT OR UPDATE OR DELETE ON attribute_values FOR EACH ROW EXECUTE FUNCTION catalog_attribute_value_changed();
CREATE TRIGGER search_attribute_value_translations_changed AFTER INSERT OR UPDATE OR DELETE ON attribute_values_translations FOR EACH ROW EXECUTE FUNCTION catalog_attribute_value_translation_changed();
CREATE TRIGGER search_reviews_changed AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION catalog_review_changed();
CREATE TRIGGER search_media_changed AFTER INSERT OR UPDATE OR DELETE ON media FOR EACH ROW EXECUTE FUNCTION catalog_media_changed();
CREATE TRIGGER search_orders_changed AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION catalog_order_changed();
CREATE TRIGGER search_order_items_changed AFTER INSERT OR UPDATE OR DELETE ON order_items FOR EACH ROW EXECUTE FUNCTION catalog_order_item_changed();
