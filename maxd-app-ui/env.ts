// env.ts
import Constants from 'expo-constants'

const ENV = Constants.expoConfig?.extra ?? {}

export const API_URL = ENV.API_URL || 'http://localhost:3001'
