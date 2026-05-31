// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/context/AuthContext.js'
import AppNavigator from './src/navigation/AppNavigator.js'

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0A0D13"/>
      <AppNavigator/>
    </AuthProvider>
  )
}
