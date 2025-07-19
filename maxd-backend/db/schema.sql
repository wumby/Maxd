-- Drop all tables if they exist (in correct dependency order)
DROP TABLE IF EXISTS
  saved_workouts,
  saved_exercises,
  sets,
  exercises,
  workouts,
  weights,
  users
CASCADE;

-- Enable UUID generation extension if not already
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  goal_mode TEXT CHECK (goal_mode IN ('lose', 'gain', 'track')) DEFAULT 'track'
);


-- WEIGHTS
CREATE TABLE weights (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WORKOUTS
CREATE TABLE workouts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- EXERCISES
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('weights', 'bodyweight', 'cardio')) NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- SETS
CREATE TABLE sets (
  id SERIAL PRIMARY KEY,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reps INTEGER,
  weight NUMERIC,
  duration INTEGER,
  distance NUMERIC,
  distance_unit TEXT CHECK (distance_unit IN ('mi', 'km', 'm', 'steps')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- SAVED EXERCISES
CREATE TABLE saved_exercises (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('weights', 'bodyweight', 'cardio')) NOT NULL,
  sets JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SAVED WORKOUTS
CREATE TABLE saved_workouts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exercises JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
