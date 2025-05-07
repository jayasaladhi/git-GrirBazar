import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const addAlert = (alert) => {
    setLowStockAlerts((prevAlerts) => [...prevAlerts, alert]);
  };

  return (
    <AlertContext.Provider value={{ lowStockAlerts, setLowStockAlerts, addAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

// Your AlertPopup component
const AlertPopup = () => {
  const { t } = useTranslation();
  const { lowStockAlerts } = useAlert();

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
    <View style={styles.container}>
    <Text style={styles.title}>{t('lowStockAlertsTitle')}</Text>      
      {lowStockAlerts.length === 0 ? (
      <View style={styles.alertCard}>
        <View style={styles.alertRow}>
          <MaterialIcons name="warning" size={24} color="white" />
          <View>
            <Text style={styles.alertText}>no Alerts</Text>
          </View>
        </View>
      </View>
      ) : (
        lowStockAlerts.map((item, index) => (
          <View key={index} style={styles.alertCard}>
          <View style={styles.alertRow}>
            <MaterialIcons name="warning" size={24} color="white" />
            <View>
              <Text style={styles.alertText}>{item.product} - Low stock</Text>
              <Text style={styles.alertText1}>Available Quantity: {item.quantity}</Text>
            </View>
          </View>
        </View>
        ))
      )}
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 30,
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft:60,
    color: '#001258',
    alignSelf: 'flex-start',
  },
  alertCard: {
    backgroundColor: '#9E2A2B',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: '70%',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
  },
  alertText1: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
  },
  noAlerts: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
  },
});

export default AlertPopup;
