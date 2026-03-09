import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/context/AppContext';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DiseaseDetectionScreen from './src/screens/DiseaseDetectionScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ShopFinderScreen from './src/screens/ShopFinderScreen';
import KnowledgeScreen from './src/screens/KnowledgeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#2c5926' }, // Updated to premium green
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  animation: 'none' // Disable animations that might cause trace trace issues on v7 layout updates
};

function AppNavigator() {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4' }}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Dashboard' : 'Auth'}
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Murimi', headerLeft: () => null }}
        />
        <Stack.Screen
          name="DiseaseDetection"
          component={DiseaseDetectionScreen}
          options={{ title: 'Scan Crop' }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Scan Results' }}
        />
        <Stack.Screen
          name="ShopFinder"
          component={ShopFinderScreen}
          options={{ title: 'Nearby Shops' }}
        />
        <Stack.Screen
          name="Knowledge"
          component={KnowledgeScreen}
          options={{ title: 'Knowledge Base' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'My Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
