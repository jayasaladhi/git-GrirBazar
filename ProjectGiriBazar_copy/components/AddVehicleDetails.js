import React, { useState, useEffect } from "react";
import {
  View,Text,TextInput,Button,StyleSheet,Alert,TouchableOpacity,ScrollView,ImageBackground,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from "react-i18next"; // Ensure i18n is set up
const API_URL = 'http://192.168.137.21:5000';

const VehicleDriverForm = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [vehicleID, setVehicleID] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [dailyWages, setDailyWages] = useState("");
  const [history, setHistory] = useState([]);
  const entry = route.params?.entry;
  const isEditMode = !!entry;  
 
  useEffect(() => {
    if (isEditMode) {
      const { vehicle, driver } = entry;
      setVehicleID(vehicle.vehicleID);
      setVehicleName(vehicle.vehicleName);
      setVehicleCapacity(String(vehicle.vehicleCapacity));
      setDriverName(driver.driverName);
      setDriverPhone(driver.driverPhone);
      setDriverLicense(driver.driverLicense);
      setDailyWages(String(driver.dailyWages));
    }
  }, [isEditMode, entry]);
  
  useFocusEffect(
    React.useCallback(() => {
      const fetchHistory = async () => {
        try {
          const response = await fetch(`${API_URL}/get-entries`);
          const data = await response.json();
          setHistory(data);
        } catch (error) {
          console.log(t("fetchError"), error);
        }
      };
      fetchHistory();
    }, [])
  );
 
  const saveDetails = async () => {
    if (!vehicleID || !vehicleName || !vehicleCapacity || !driverName || !driverPhone || !driverLicense || !dailyWages) {
      Alert.alert(t("error"), t("fillAllFields"));
      return;
    }
 
    const newEntry = {
      vehicle: { vehicleID, vehicleName, vehicleCapacity },
      driver: { driverName, driverPhone, driverLicense, dailyWages },
    };
 
    try {
      const url = isEditMode
      ? `${API_URL}/update-entry/${entry.id}`
      : `${API_URL}/add-entry`;
    const method = isEditMode ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });    

      const result = await response.json();
      if (response.ok) {
        Alert.alert(t("success"), isEditMode ? t("detailsUpdated") : t("detailsSaved"));
        navigation.navigate("VehicleDriverHistory");
      }
      
      if (response.ok) {
        Alert.alert(t("success"), t("detailsSaved"));
        navigation.navigate("VehicleDriverHistory");
      } else {
        Alert.alert(t("error"), result.error || t("saveError"));
      }
    } catch (error) {
      Alert.alert(t("error"), t("saveError"));
    }
  };  
 
  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("vehicleDetailsTitle")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("vehicleIDPlaceholder")}
          value={vehicleID}
          onChangeText={setVehicleID}
        />
        <TextInput
          style={styles.input}
          placeholder={t("vehicleNamePlaceholder")}
          value={vehicleName}
          onChangeText={setVehicleName}
        />
        <TextInput
          style={styles.input}
          placeholder={t("vehicleCapacityPlaceholder")}
          value={vehicleCapacity}
          onChangeText={(text) => text.match(/^\d*$/) && setVehicleCapacity(text)}
          keyboardType="numeric"
        />
 
        <Text style={styles.title}>{t("driverDetailsTitle")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("driverNamePlaceholder")}
          value={driverName}
          onChangeText={setDriverName}
        />
        <TextInput
          style={styles.input}
          placeholder={t("driverPhonePlaceholder")}
          value={driverPhone}
          onChangeText={(text) => {
            const formattedText = text.replace(/[^0-9]/g, '');
            if (formattedText.length <= 10) {
              setDriverPhone(formattedText)
            }
          }}
          keyboardType="numeric"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder={t("driverLicensePlaceholder")}
          value={driverLicense}
          onChangeText={setDriverLicense}
        />
        <TextInput
          style={styles.input}
          placeholder={t("dailyWagesPlaceholder")}
          value={dailyWages}
          onChangeText={(text) => text.match(/^\d*$/) && setDailyWages(text)}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveDetails}>
          <Text style={styles.saveButtonText}>{isEditMode ? t("updateDetails") : t("saveDetails")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={()=>navigation.navigate("VehicleDriverHistory")}>
          <Text style={styles.saveButtonText}>Vehicle-History</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};
 
const VehicleDriverHistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [searchID, setSearchID] = useState("");
 
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/get-entries`);
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.log(t("fetchError"), error);
      }
    };
    fetchHistory();
  }, []);  
 
  const removeEntry = async (id) => {
    console.log("Deleting entry with ID:", id);
    try {
      const response = await fetch(`${API_URL}/delete-entry/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setHistory(prev => prev.filter(entry => entry.id !== id));
        Alert.alert(t(""), t("Vehicle-Driver Details Deleted")); 
      } else {
        const errorData = await response.json();
        Alert.alert(t("error"), errorData.error || t("removeError"));
      }
    } catch (error) {
      Alert.alert(t("error"), t("removeError"));
    }
  };   
  const confirmDelete = (id) => {
    Alert.alert(
      t(" "),
      t("confirm Delete"),
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("delete"), onPress: () => removeEntry(id), style: "destructive" },
      ]
    );
  };
  
  const filteredHistory = history.filter(entry =>
    entry.vehicle.vehicleID.toLowerCase().includes(searchID.toLowerCase())
  );
 
  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("vehicleDriverHistoryTitle")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("searchVehicleIDPlaceholder")}
          value={searchID}
          onChangeText={setSearchID}
        />
        {filteredHistory.length > 0 ? (
          filteredHistory.map((entry, index) => (   
            <View key={index} style={styles.card}>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("vehicleID")}: </Text>{entry.vehicle.vehicleID}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("vehicleName")}: </Text>{entry.vehicle.vehicleName}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("vehicleCapacity")}: </Text>{entry.vehicle.vehicleCapacity}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("driverName")}: </Text>{entry.driver.driverName}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("driverPhone")}: </Text>{entry.driver.driverPhone}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("driverLicense")}: </Text>{entry.driver.driverLicense}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("dailyWages")}: </Text>{entry.driver.dailyWages}</Text>
              <View style={styles.buttonContainer}>
              <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate("Form", { entry, index })}
                >
                  <Text style={styles.editButtonText}>{t("edit")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={() => confirmDelete(entry.id)}>
                  <Text style={styles.removeButtonText}>{t("remove")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>{t("noData")}</Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
};
 
const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "bold", color: "black", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white"
  },
  card: {
    backgroundColor: "lightblue",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  cardText: { fontSize: 16, color: "black", marginBottom: 2 },
  bold: { fontWeight: "bold" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  editButton: {
    backgroundColor: "#46a2da",
    padding: 5,
    borderRadius: 3,
    alignItems: "center",
    flex: 1,
    marginRight: 5
  },
  editButtonText: { color: "white", fontWeight: "bold" },
  removeButton: {
    backgroundColor: "#D9534F",
    padding: 5,
    borderRadius: 3,
    alignItems: "center",
    flex: 1,
    marginLeft: 5
  },
  removeButtonText: { color: "white", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#46a2da",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  noDataText: { textAlign: "center", color: "gray", marginTop: 20 },
});
 
export { VehicleDriverForm, VehicleDriverHistoryScreen };