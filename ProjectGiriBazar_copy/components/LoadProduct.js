import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddProduct from './AddProductPage';
import ListPage from './ListPage';
import InventoryPage from './InventoryPage';

const Stack = createStackNavigator();

export default function LoadProduct() {
  return (
      <Stack.Navigator initialRouteName="AddProduct">
        <Stack.Screen name="AddProduct" component={AddProduct} options={{ headerShown: false }} />
        <Stack.Screen name="List" component={ListPage} options={{ headerShown: false  }} />
        <Stack.Screen name="Inventory" component={InventoryPage} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}
