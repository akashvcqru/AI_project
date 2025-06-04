import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { onboardingApi } from '@/features/onboardingApi'
import { adminApi } from '@/features/adminApi'
import onboardingReducer from '@/features/onboardingSlice'
import authReducer from '@/features/authSlice'

export const store = configureStore({
  reducer: {
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    onboarding: onboardingReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(onboardingApi.middleware, adminApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 