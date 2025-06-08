import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from './slices/authSlice'
import onboardingReducer from './slices/onboardingSlice'
import { adminApi } from './services/adminApi'
import { onboardingApi } from './services/onboardingApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware, onboardingApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 