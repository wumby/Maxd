-- db/migrations/002-cascade-deletes.sql

-- Adjust foreign keys to add ON DELETE CASCADE

-- weights
ALTER TABLE weights
  DROP CONSTRAINT IF EXISTS weights_user_id_fkey,
  ADD CONSTRAINT weights_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- workouts
ALTER TABLE workouts
  DROP CONSTRAINT IF EXISTS workouts_user_id_fkey,
  ADD CONSTRAINT workouts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- exercises
ALTER TABLE exercises
  DROP CONSTRAINT IF EXISTS exercises_workout_id_fkey,
  ADD CONSTRAINT exercises_workout_id_fkey
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE;

ALTER TABLE exercises
  DROP CONSTRAINT IF EXISTS exercises_user_id_fkey,
  ADD CONSTRAINT exercises_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- sets
ALTER TABLE sets
  DROP CONSTRAINT IF EXISTS sets_exercise_id_fkey,
  ADD CONSTRAINT sets_exercise_id_fkey
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE sets
  DROP CONSTRAINT IF EXISTS sets_user_id_fkey,
  ADD CONSTRAINT sets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
