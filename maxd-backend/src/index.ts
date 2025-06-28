import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import weightRoutes from './routes/weights.routes';
import workoutRoutes from './routes/workouts.routes'
import userRoutes from './routes/users.routes'
import savedExercisesRoutes from './routes/savedExercises.routes'
import savedWorkoutsRoutes from './routes/savedWorkouts.routes'
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/weights', weightRoutes);
app.use('/workouts', workoutRoutes);
app.use('/saved-exercises', savedExercisesRoutes)
app.use('/saved-workouts', savedWorkoutsRoutes)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
