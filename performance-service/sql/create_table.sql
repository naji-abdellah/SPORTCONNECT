-- SQL to create performances table
CREATE TABLE performances (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    calories DOUBLE PRECISION NOT NULL,
    duration INTEGER NOT NULL,
    date DATE NOT NULL
);
