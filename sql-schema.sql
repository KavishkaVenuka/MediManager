
-- 1. Medicine Table (The Catalog)
CREATE TABLE medicine (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    weight TEXT, 
    pack_size INTEGER NOT NULL DEFAULT 1
);

-- 2. Main Store (Bulk Storage)
CREATE TABLE main_store (
    item_id UUID REFERENCES medicine(id) ON DELETE CASCADE,
    retail_price DECIMAL(10, 2) NOT NULL,
    pack_qty INTEGER DEFAULT 0,
    pill_qty INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, retail_price)
);

-- 3. Pharmacy Table (The Selling Shelf)
-- Keeps the Composite Key (item_id + buy_price) to track batches/profit
CREATE TABLE pharmacy (
    item_id UUID REFERENCES medicine(id) ON DELETE CASCADE,
    retail_price DECIMAL(10, 2) NOT NULL,
    pack_qty INTEGER DEFAULT 0,
    pill_qty INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, retail_price)
);

-- 4. Point of Sale (Ready to Sell Stock)
CREATE TABLE point_of_sale (
    item_id UUID REFERENCES medicine(id) ON DELETE CASCADE,
    retail_price DECIMAL(10, 2) NOT NULL,
    pack_qty INTEGER DEFAULT 0,
    pill_qty INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, retail_price)
);

-- 5. Inward Register (Stock Entry Log)
CREATE TABLE inward_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id UUID REFERENCES medicine(id) ON DELETE SET NULL,
    destination VARCHAR(100) NOT NULL, -- 'Pharmacy' or 'Main Store'
    qty_packs INTEGER NOT NULL,
    free_packs INTEGER DEFAULT 0,
    buy_price DECIMAL(10, 2) NOT NULL,
    retail_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sales (Stock Exit Log)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL
);

-- 7. Sale Items (Stock Exit Log)
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id),
    item_id UUID REFERENCES medicine(id),
    qty INTEGER NOT NULL,
    unit_buy_price DECIMAL(10, 2) NOT NULL, 
    unit_sell_price DECIMAL(10, 2) NOT NULL
);


-- Indexes
CREATE INDEX idx_medicine_name ON medicine(name);
CREATE INDEX idx_pharmacy_item ON pharmacy(item_id);
