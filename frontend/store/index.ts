import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { onboardingApi } from './services/onboardingApi'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(onboardingApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 