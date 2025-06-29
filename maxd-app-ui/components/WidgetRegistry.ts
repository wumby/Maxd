import { LastWorkoutWidget } from './widgets/LastWorkoutWidget'
import { StreakWidget } from './widgets/StreakWidget'

export const widgetRegistry = {
  weightChart: {
    component: LastWorkoutWidget,
    width: '100%', // or '48%' for half-width
  },
  workoutSummary: {
    component: StreakWidget,
    width: '48%',
  },
}
