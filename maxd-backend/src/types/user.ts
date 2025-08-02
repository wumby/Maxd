export type GoalMode = 'gain' | 'lose' | 'track'

export interface User {
  id: string
  name: string
  email: string
  password: string
  goal_mode: GoalMode
}

export type PublicUser = Omit<User, 'password'>
