import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Keyboard, Modal, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';
import { LanguageProvider } from './components/style';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Account from './components/Account';
import Logout from './components/Logout';
import AddProductCategory from './components/AddProductCategory';
import  { VehicleDriverForm, VehicleDriverHistoryScreen } from './components/AddVehicleDetails';
import ProfitLossScreen from './components/Profit&Loss';
import AlertPopup, { AlertProvider } from './components/AlertPopup';
import LoginPage from './components/LoginPage';
import LoadProduct from './components/LoadProduct';
import Inventory from './components/InventoryPage';
import Sell from './components/Sell';
import Reports from './components/Reports';

const Tab = createBottomTabNavigator();

// Drawer Navigator
const Drawer = createDrawerNavigator();

// Main Stack Navigator
const Stack = createStackNavigator();



// Sample Screens for Tab Navigation
const HomeScreen = () => {
  const { t } = useTranslation();
  return <View style={styles.screenContainer}><Text style={styles.screenText}>{t('homeTab')}</Text></View>;
};

const SearchScreen = () => {
  const { t } = useTranslation();
  return <View style={styles.screenContainer}><Text style={styles.screenText}>{t('searchTab')}</Text></View>;
};

const AddScreen = () => {
  const { t } = useTranslation();
  return <View style={styles.screenContainer}><Text style={styles.screenText}>{t('addTab')}</Text></View>;
};

const NotificationsScreen = () => {
  const { t } = useTranslation();
  return <View style={styles.screenContainer}><Text style={styles.screenText}>{t('notificationsTab')}</Text></View>;
};

const ProfileScreen = () => {
  const { t } = useTranslation();
  return <View style={styles.screenContainer}><Text style={styles.screenText}>{t('profileTab')}</Text></View>;
};

// Custom Drawer Content
function CustomDrawerContent({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.drawerContainer}>
      <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate(t('addCategoriesProducts'))}>
        <Text style={styles.drawerText}>{t('addCategoriesProducts')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate(t('addVehicleDetails'))}>
        <Text style={styles.drawerText}>{t('addVehicleDetails')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate(t('reports'))}>
        <Text style={styles.drawerText}>{t('reports')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Account Dropdown Component
const AccountDropdown = ({ visible, onClose, navigation }) => {
  const { t } = useTranslation();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.dropdownOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View style={[styles.dropdownContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.dropdownItem}
            onPress={() => {
              onClose();
              navigation.navigate("Account");
            }}
          >
            <Ionicons name="person-circle-outline" size={20} color="#333" />
            <Text style={styles.dropdownItemText}>{t('account')}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.dropdownItem}
            onPress={() => {
              onClose();
              navigation.navigate("Logout");
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#333" />
            <Text style={styles.dropdownItemText}>{t('logout')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Bottom Tab Navigator configuration
function TabNavigator({ navigation }) {
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: styles.headerStyle,
          headerLeft: () => (
            <Ionicons
              name="menu"
              size={30}
              color="black"
              style={styles.menuIcon}
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
              <Ionicons
                name="person-circle"
                size={30}
                color="black"
                style={styles.profileIcon}
              />
            </TouchableOpacity>
          ),
          headerTitle: null,
          tabBarIcon: ({ focused }) => {
            let imageSource;
            if (route.name === t('homeTab')) {
              imageSource = focused ? require('./assets/home1.png') : require('./assets/home2.png');
            } else if (route.name === t('inventoryTab')) {
              imageSource = focused ? require('./assets/track.png') : require('./assets/track.png');
            } else if (route.name === t('sellTab')) {
              imageSource = focused ? require('./assets/sell1.png') : require('./assets/sell1.png');
            } else if (route.name === t('notificationsTab')) {
              imageSource = focused ? require('./assets/notification1.png') : require('./assets/notification2.png');
            } else if (route.name === t('profitLossTab')) {
              imageSource = focused ? require('./assets/profit.png') : require('./assets/profit.png');
            }
            return <Image source={imageSource} style={styles.tabIcon} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'black',
          tabBarShowLabel: false,
          tabBarStyle: isKeyboardVisible
          ? { height: 0, overflow: 'hidden' }  // hide when keyboard is open
          : styles.tabBarStyle,        
        })}
      >
        <Tab.Screen name={t('homeTab')} component={LoadProduct} />
        <Tab.Screen name={t('inventoryTab')} component={Inventory} />
        <Tab.Screen name={t('sellTab')} component={Sell} />
        <Tab.Screen name={t('profitLossTab')} component={ProfitLossScreen} />
        <Tab.Screen name={t('notificationsTab')} component={AlertPopup} />
      </Tab.Navigator>
      
      <AccountDropdown 
        visible={dropdownVisible} 
        onClose={() => setDropdownVisible(false)} 
        navigation={navigation}
      />
    </>
  );
}

// Main App Screen
function App() {
  const { t } = useTranslation();
  return (
    <LanguageProvider>
      <AlertProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Account"
            component={Account}
            options={{ title: t('accountDetailsTitle') }}
          />
          <Stack.Screen
            name="Logout"
            component={Logout}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddProductCategory"
            component={AddProductCategory}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Add Vehicle Details"
            component={VehicleStackNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </AlertProvider>
    </LanguageProvider>
  );
}

// Drawer Navigator wrapping the Tab Navigator
function DrawerNavigator() {
  const { t } = useTranslation();
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name={t('mainTab')} component={TabNavigator} />
      <Drawer.Screen
        name={t('addCategoriesProducts')}
        component={AddProductCategory}
        options={({ navigation }) => ({
          headerShown: true,
          headerStyle: styles.headerStyle,
          headerTitle: t('addCategoriesProducts'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(t('mainTab'))} style={{ marginLeft: 15 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name={t('addVehicleDetails')}
        component={VehicleStackNavigator}
        options={({ navigation }) => ({
          headerShown: true,
          headerStyle: styles.headerStyle,
          headerTitle: t('addVehicleDetails'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(t('mainTab'))} style={{ marginLeft: 15 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name={t('reports')}
        component={Reports}
        options={({ navigation }) => ({
          headerShown: true,
          headerStyle: styles.headerStyle,
          headerTitle: t('reports'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(t('mainTab'))} style={{ marginLeft: 15 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
    </Drawer.Navigator>
  );
}

// Vehicle Details Stack Navigator
const VehicleStack = createStackNavigator();

function VehicleStackNavigator() {
  return (
    <VehicleStack.Navigator screenOptions={{ headerShown: false }}>
      <VehicleStack.Screen name="Form" component={VehicleDriverForm} />
      <VehicleStack.Screen name="VehicleDriverHistory" component={VehicleDriverHistoryScreen} />
    </VehicleStack.Navigator>
  );
}

// Styles for the app
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: 'lightblue',
    paddingTop: 90,
    paddingLeft: 20,
    borderRadius: 10,
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 10,
    marginRight: 20,
  },
  drawerText: {
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
  },
  headerStyle: {
    backgroundColor: '#fff',
    height:90,
  },
  menuIcon: {
    marginLeft: 10,
  },
  profileIcon: {
    marginRight: 10,
  },
  tabBarStyle: {
    backgroundColor: 'lightblue',
    height: 60,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    paddingBottom: 5,
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginTop: 10,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  screenText: {
    fontSize: 24,
    color: '#333',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 10,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    width: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
});

export default App;