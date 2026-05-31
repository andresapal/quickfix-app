import React, { useContext } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import AuthContext from '../context/AuthContext.js'
import { COLORS, APP_COLORS } from '../theme/index.js'

import LoginScreen            from '../screens/auth/LoginScreen.js'
import HomeScreen             from '../screens/client/HomeScreen.js'
import ExpertDetailScreen     from '../screens/client/ExpertDetailScreen.js'
import BookingCheckoutScreen  from '../screens/client/BookingCheckoutScreen.js'
import BookingConfirmedScreen from '../screens/client/BookingConfirmedScreen.js'
import MyBookingsScreen       from '../screens/client/MyBookingsScreen.js'
import ExpertDashboardScreen  from '../screens/expert/ExpertDashboardScreen.js'

const Stack = createStackNavigator()
const Tab   = createBottomTabNavigator()

// ← Cambiar APP_ID al compilar cada app
const APP_ID   = 'QUICKFIX'
const appConfig = { ...APP_COLORS[APP_ID], id: APP_ID }

const TAB_ICONS = { Inicio:'🏠', Reservas:'📅', Perfil:'👤' }

function ClientTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor:COLORS.bg2, borderTopColor:COLORS.border, height:60, paddingBottom:8 },
      tabBarActiveTintColor: appConfig.primary,
      tabBarInactiveTintColor: COLORS.muted,
      tabBarIcon: ({ color }) => <Text style={{ fontSize:20 }}>{TAB_ICONS[route.name]||'•'}</Text>,
      tabBarLabel: ({ color }) => <Text style={{ fontSize:10, fontWeight:'700', color }}>{route.name}</Text>,
    })}>
      <Tab.Screen name="Inicio"   component={HomeStack}/>
      <Tab.Screen name="Reservas" component={MyBookingsScreen} initialParams={{ appConfig }}/>
      <Tab.Screen name="Perfil"   component={() => <View style={{ flex:1, backgroundColor:COLORS.bg, alignItems:'center', justifyContent:'center' }}><Text style={{ color:COLORS.muted }}>👤 Perfil</Text></View>}/>
    </Tab.Navigator>
  )
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="Home"             component={HomeScreen}            initialParams={{ appConfig }}/>
      <Stack.Screen name="ExpertDetail"     component={ExpertDetailScreen}/>
      <Stack.Screen name="BookingCheckout"  component={BookingCheckoutScreen}/>
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen}/>
      <Stack.Screen name="MyBookings"       component={MyBookingsScreen}      initialParams={{ appConfig }}/>
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext)
  if (loading) return (
    <View style={{ flex:1, backgroundColor:COLORS.bg, alignItems:'center', justifyContent:'center' }}>
      <ActivityIndicator size="large" color={appConfig.primary}/>
    </View>
  )
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>
        {!user
          ? <Stack.Screen name="Login"     component={LoginScreen}           initialParams={{ appConfig }}/>
          : user.role==='EXPERT'
          ? <Stack.Screen name="ExpertApp" component={ExpertDashboardScreen} initialParams={{ appConfig }}/>
          : <Stack.Screen name="ClientApp" component={ClientTabs}/>
        }
      </Stack.Navigator>
    </NavigationContainer>
  )
}
