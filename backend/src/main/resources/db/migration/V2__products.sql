-- MMM - Mousie Moncso Makros: food product database with pre-filled macros

CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    protein_g       NUMERIC(6,2) NOT NULL DEFAULT 0,
    carbs_g         NUMERIC(6,2) NOT NULL DEFAULT 0,
    fat_g           NUMERIC(6,2) NOT NULL DEFAULT 0,
    is_custom       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness so "Oats" and "oats" can't both be added
CREATE UNIQUE INDEX ux_products_name_lower ON products (lower(name));

-- Macro values are per 100g of the product, average/typical values.
INSERT INTO products (name, protein_g, carbs_g, fat_g) VALUES
    ('Rolled oats', 13.5, 68.0, 6.5),
    ('White rice (cooked)', 2.7, 28.0, 0.3),
    ('Brown rice (cooked)', 2.6, 23.0, 0.9),
    ('Chicken breast (raw)', 23.0, 0.0, 2.0),
    ('Chicken thigh (raw)', 18.0, 0.0, 10.0),
    ('Turkey breast (raw)', 24.0, 0.0, 1.0),
    ('Beef, lean (raw)', 21.0, 0.0, 10.0),
    ('Salmon (raw)', 20.0, 0.0, 13.0),
    ('Tuna (canned in water)', 26.0, 0.0, 1.0),
    ('Eggs, whole', 13.0, 1.1, 11.0),
    ('Egg white', 11.0, 0.7, 0.2),
    ('Whole milk', 3.3, 4.8, 3.6),
    ('Skim milk', 3.4, 5.0, 0.2),
    ('Greek yogurt (2%)', 10.0, 4.0, 2.0),
    ('Natural yogurt', 3.5, 4.7, 3.0),
    ('Cottage cheese', 11.0, 3.4, 4.3),
    ('Cheddar cheese', 25.0, 1.3, 33.0),
    ('Mozzarella', 22.0, 2.2, 22.0),
    ('Whole wheat bread', 9.0, 41.0, 3.5),
    ('White bread', 8.0, 49.0, 3.0),
    ('Banana', 1.1, 23.0, 0.3),
    ('Apple', 0.3, 14.0, 0.2),
    ('Almonds', 21.0, 22.0, 50.0),
    ('Peanut butter', 25.0, 20.0, 50.0),
    ('Olive oil', 0.0, 0.0, 100.0),
    ('Butter', 0.9, 0.1, 81.0),
    ('Avocado', 2.0, 9.0, 15.0),
    ('Potato (boiled)', 2.0, 17.0, 0.1),
    ('Sweet potato (boiled)', 1.6, 20.0, 0.1),
    ('Pasta (cooked)', 5.8, 25.0, 0.9),
    ('Quinoa (cooked)', 4.4, 21.0, 1.9),
    ('Lentils (cooked)', 9.0, 20.0, 0.4),
    ('Chickpeas (cooked)', 8.9, 27.0, 2.6),
    ('Black beans (cooked)', 8.9, 24.0, 0.5),
    ('Tofu', 8.0, 1.9, 4.8),
    ('Shrimp (cooked)', 24.0, 0.2, 0.3),
    ('Whey protein powder', 80.0, 7.0, 7.0),
    ('Honey', 0.3, 82.0, 0.0),
    ('Dark chocolate (70%)', 7.8, 46.0, 43.0),
    ('Walnuts', 15.0, 14.0, 65.0),
    ('Rice cakes', 8.0, 80.0, 2.8),
    ('Granola', 10.0, 64.0, 15.0),
    ('Corn (boiled)', 3.3, 19.0, 1.3),
    ('Hummus', 8.0, 14.0, 10.0),
    ('Protein bar (generic)', 30.0, 40.0, 10.0);
