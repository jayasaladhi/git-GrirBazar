// App.js (Entry Point for the React Native Web App)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SellProduct from './SellProduct';
import SellHistory from './SellHistory';
import Reports from './Reports';

const Stack = createStackNavigator();

export default function Sell() {
  return (
      <Stack.Navigator initialRouteName="SellProduct">
        <Stack.Screen name="SellProduct" component={SellProduct} options={{ headerShown: false }}  />
        <Stack.Screen name="SellHistory" component={SellHistory}  options={{ headerShown: false }} />
        <Stack.Screen name="Reports" component={Reports}  options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}
