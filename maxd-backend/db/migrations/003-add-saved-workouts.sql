CREATE TABLE saved_exercises (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('weights', 'bodyweight', 'cardio')) NOT NULL,
  sets JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_workouts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exercises JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
