-- Reusable meal definitions shared by all users. Meals are unique by case-insensitive name.

CREATE TABLE saved_meals (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(120) NOT NULL,
    type                VARCHAR(32) NOT NULL,
    created_by_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_saved_meals_name_lower ON saved_meals (lower(name));
CREATE INDEX idx_saved_meals_fts ON saved_meals USING GIN (to_tsvector('simple', name));

CREATE TABLE saved_meal_items (
    id              BIGSERIAL PRIMARY KEY,
    saved_meal_id   BIGINT NOT NULL REFERENCES saved_meals(id) ON DELETE CASCADE,
    item_type       VARCHAR(16) NOT NULL DEFAULT 'INGREDIENT',
    name            VARCHAR(120) NOT NULL,
    grams           NUMERIC(7,1) NOT NULL,
    protein_g       NUMERIC(6,1) NOT NULL DEFAULT 0,
    carbs_g         NUMERIC(6,1) NOT NULL DEFAULT 0,
    fat_g           NUMERIC(6,1) NOT NULL DEFAULT 0
);

CREATE INDEX idx_saved_meal_items_meal ON saved_meal_items(saved_meal_id);

-- Backfill: one saved meal per distinct name, using the most recent existing meal as the definition.
INSERT INTO saved_meals (name, type, created_by_user_id, created_at)
SELECT DISTINCT ON (lower(name)) name, type, user_id, created_at
FROM meals
ORDER BY lower(name), created_at DESC, id DESC;

INSERT INTO saved_meal_items (saved_meal_id, item_type, name, grams, protein_g, carbs_g, fat_g)
SELECT sm.id, mi.item_type, mi.name, mi.grams, mi.protein_g, mi.carbs_g, mi.fat_g
FROM saved_meals sm
JOIN (
    SELECT DISTINCT ON (lower(name)) id, name
    FROM meals
    ORDER BY lower(name), created_at DESC, id DESC
) latest ON lower(latest.name) = lower(sm.name)
JOIN meal_items mi ON mi.meal_id = latest.id;
