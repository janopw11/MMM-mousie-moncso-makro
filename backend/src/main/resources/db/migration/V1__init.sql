-- MMM - Mousie Moncso Makros: initial schema

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(64) NOT NULL UNIQUE,
    veggie_goal_g   INTEGER NOT NULL DEFAULT 500,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE daily_goals (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_date       DATE NOT NULL,
    protein_g       NUMERIC(6,1) NOT NULL DEFAULT 0,
    carbs_g         NUMERIC(6,1) NOT NULL DEFAULT 0,
    fat_g           NUMERIC(6,1) NOT NULL DEFAULT 0,
    veggies_goal_g  INTEGER NOT NULL DEFAULT 500,
    CONSTRAINT uq_daily_goal_user_date UNIQUE (user_id, goal_date)
);

CREATE TABLE meals (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_date       DATE NOT NULL,
    name            VARCHAR(120) NOT NULL,
    type            VARCHAR(32) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date);

CREATE TABLE meal_items (
    id              BIGSERIAL PRIMARY KEY,
    meal_id         BIGINT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    item_type       VARCHAR(16) NOT NULL DEFAULT 'INGREDIENT',
    name            VARCHAR(120) NOT NULL,
    grams           NUMERIC(7,1) NOT NULL,
    protein_g       NUMERIC(6,1) NOT NULL DEFAULT 0,
    carbs_g         NUMERIC(6,1) NOT NULL DEFAULT 0,
    fat_g           NUMERIC(6,1) NOT NULL DEFAULT 0
);

CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);

-- Seed a default demo user so the app is usable immediately after first start
INSERT INTO users (username, veggie_goal_g) VALUES ('Moncso', 500);
