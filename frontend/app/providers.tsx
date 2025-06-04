'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { AuthProvider } from '../contexts/AuthContext'
import { OnboardingProvider } from '../contexts/OnboardingContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </AuthProvider>
    </Provider>
  )
} 