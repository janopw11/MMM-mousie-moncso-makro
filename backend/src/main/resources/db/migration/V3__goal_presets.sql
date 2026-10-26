-- Reusable named daily goals (e.g. "High day") that can be applied to any date

CREATE TABLE goal_presets (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(64) NOT NULL,
    protein_g       NUMERIC(6,1) NOT NULL DEFAULT 0,
    carbs_g         NUMERIC(6,1) NOT NULL DEFAULT 0,
    fat_g           NUMERIC(6,1) NOT NULL DEFAULT 0,
    veggies_goal_g  INTEGER NOT NULL DEFAULT 500,
    CONSTRAINT uq_goal_preset_user_name UNIQUE (user_id, name)
);
