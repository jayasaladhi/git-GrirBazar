import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { createStackNavigator } from '@react-navigation/stack';
const API_URL = 'http://192.168.137.21:5000';
const Stack = createStackNavigator();
 
const Account = ({ navigation }) => {
  const { t } = useTranslation(); // Use translation hook
  const [sellerName, setSellerName] = useState('John Doe');
  const [vehicleId, setVehicleId] = useState('AP21AR2273');
  const [driverName, setDriverName] = useState('Gray John');
  const [phoneNumber, setPhoneNumber] = useState('+91 123456789');
  const [isEditable, setIsEditable] = useState({ name: false, phone: false, id: false, driver: false });
 
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/add-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerName, phoneNumber, vehicleId, driverName })
      });
 
      const result = await response.json();
 
      if (response.ok) {
        navigation.navigate('Details', { sellerName, phoneNumber, vehicleId, driverName });
      } else {
        alert(result.error || t("saveError"));
      }
    } catch (error) {
      alert(t("saveError") + ": " + error.message);
    }
  };  
  const SellerListScreen = () => {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
 
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/get-accounts`);
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        alert(t("fetchError") + ": " + error.message);
      } finally {
        setLoading(false);
      }
    };
 
    React.useEffect(() => {
      fetchAccounts();
    }, []);
 
    return (
      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{t('allSellerAccounts')}</Text>
        {loading ? (
          <Text>{t('loading')}...</Text>
        ) : accounts.length === 0 ? (
          <Text>{t('noAccountsFound')}</Text>
        ) : (
          accounts.map(account => (
            <View key={account.id} style={styles.accountCard}>
              <Text style={styles.detailsText}>{t('sellerNameLabel')}: {account.sellerName}</Text>
              <Text style={styles.detailsText}>{t('phoneNumberLabel')}: {account.phoneNumber}</Text>
              <Text style={styles.detailsText}>{t('vehicleIdLabel')}: {account.vehicleId}</Text>
              <Text style={styles.detailsText}>{t('driverNameLabel')}: {account.driverName}</Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };
 
  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.name}>{t('sellerDetailsTitle')}</Text>
 
          <Text style={styles.label}>{t('sellerIdLabel')}</Text>
          <TextInput style={styles.input} editable={false} value="S12345" />
 
          {[
            { label: t('sellerNameLabel'), state: sellerName, setState: setSellerName, key: 'name' },
            { label: t('phoneNumberLabel'), state: phoneNumber, setState: setPhoneNumber, key: 'phone', keyboardType: 'phone-pad' },
            { label: t('vehicleIdLabel'), state: vehicleId, setState: setVehicleId, key: 'id' },
            { label: t('driverNameLabel'), state: driverName, setState: setDriverName, key: 'driver' }
          ].map(({ label, state, setState, key, keyboardType }) => (
            <View key={key}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity onPress={() => setIsEditable({ ...isEditable, [key]: !isEditable[key] })}>
                  <Text style={styles.editButton}>{isEditable[key] ? t('saveButton') : t('editButton')}</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                editable={isEditable[key]}
                keyboardType={keyboardType || 'default'}
              />
            </View>
          ))}
 
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>{t('submitButton')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
 
const DetailsScreen = ({ route }) => {
  const { t } = useTranslation(); // Use translation hook
  const { sellerName, phoneNumber, vehicleId, driverName } = route.params;
 
  return (
    <ScrollView contentContainerStyle={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>{t('submittedDetailsTitle')}</Text>
      <Text style={styles.detailsText}>{t('sellerNameLabel')}: {sellerName}</Text>
      <Text style={styles.detailsText}>{t('phoneNumberLabel')}: {phoneNumber}</Text>
      <Text style={styles.detailsText}>{t('vehicleIdLabel')}: {vehicleId}</Text>
      <Text style={styles.detailsText}>{t('driverNameLabel')}: {driverName}</Text>
    </ScrollView>
  );
};
 
export default function App() {
  return (
      <Stack.Navigator>
        <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}
 
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Ensure the image covers the whole screen
    justifyContent: "center",
  },
  container: { flex: 1 },
  scrollContainer: { padding: 20, justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: 'gray' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  editButton: { backgroundColor: '#7EA7D8', color: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, fontWeight: 'bold' },
  submitButton: { backgroundColor: '#001258', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  name: { color: 'black', fontSize: 25, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  detailsContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  detailsTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  detailsText: { fontSize: 18, marginBottom: 10 },
});