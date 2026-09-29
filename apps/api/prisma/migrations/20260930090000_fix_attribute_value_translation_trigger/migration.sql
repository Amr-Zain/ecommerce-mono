-- Qualify the column reference because the trigger function declares a
-- PL/pgSQL variable with the same name as the source column.
CREATE OR REPLACE FUNCTION catalog_attribute_value_translation_changed() RETURNS TRIGGER AS $$
DECLARE row_data RECORD; attribute_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := OLD; ELSE row_data := NEW; END IF;
  SELECT av.attribute_id::text INTO attribute_id
    FROM attribute_values AS av
    WHERE av.id = row_data.record_id;
  IF attribute_id IS NOT NULL THEN
    PERFORM catalog_enqueue_change(
      jsonb_build_object('entity', 'attribute', 'entityId', row_data.record_id::text, 'attributeId', attribute_id),
      'attribute', attribute_id
    );
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
