-- File: ogs-client/depot/supabase_trigger.sql
-- Run this in your Supabase SQL Editor to ensure updated_at changes automatically

-- 1. Create the function to update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Create the trigger for the 'products' table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 3. (Optional) Create the trigger for the 'sale_items' table if you ever plan to edit items
DROP TRIGGER IF EXISTS update_sale_items_updated_at ON sale_items;
-- Note: sale_items often doesn't have updated_at, but if you added it, uncomment below:
-- CREATE TRIGGER update_sale_items_updated_at
-- BEFORE UPDATE ON sale_items
-- FOR EACH ROW
-- EXECUTE PROCEDURE update_updated_at_column();
