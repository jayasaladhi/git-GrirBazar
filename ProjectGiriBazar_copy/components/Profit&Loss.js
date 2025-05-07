import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const API_URL = 'http://192.168.137.21:5000'; 

const ProfitLossScreen = () => {
  const [totalSale, setTotalSale] = useState("");
  const [loadedStock, setLoadedStock] = useState("");
  const [totalExpenses, setTotalExpenses] = useState("");
  const [remainingStock, setRemainingStock] = useState("");
  const [calculatedProfitLoss, setCalculatedProfitLoss] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchTodayValues();
  }, []);

  const fetchTodayValues = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profitloss/today`);
      const data = await res.json();
  
      setTotalSale((data.total_sale ?? 0).toString());
      setLoadedStock((data.loaded_stock ?? 0).toString());
      setRemainingStock((data.remaining_stock ?? 0).toString());
    } catch (err) {
      console.error("Error fetching today values", err);
      setTotalSale("0");
      setLoadedStock("0");
      setRemainingStock("0");
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchTodayValues();
    }, [])
  );
  const handleCalculate = async () => {
    const sale = parseFloat(totalSale) || 0;
    const stock = parseFloat(loadedStock) || 0;
    const expenses = parseFloat(totalExpenses) || 0;
    const remainingStockAmount = parseFloat(remainingStock) || 0;
    const result = sale - (stock + expenses + remainingStockAmount);
    setCalculatedProfitLoss(result);
  
    const payload = {
      date: new Date().toISOString().split("T")[0],
      total_sale: sale,
      loaded_stock: stock,
      remaining_stock: remainingStockAmount,
      daily_expense: expenses,
      profit_or_loss: result,
    };
  
    try {
      await fetch(`${API_URL}/api/profitloss/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error saving profit/loss", err);
    }
  };  

  const isProfit = calculatedProfitLoss !== null && calculatedProfitLoss >= 0;

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>
          <Icon name="finance" size={32} color="#0077b6" /> Profit & Loss
        </Text>

        {[ 
          { label: "Total Sale", value: totalSale, setValue: setTotalSale, icon: "cash", editable: false },
          { label: "Loaded Stock Price", value: loadedStock, setValue: setLoadedStock, icon: "truck", editable: false },
          { label: "Remaining Stock Price", value: remainingStock, setValue: setRemainingStock, icon: "warehouse", editable: false },
          { label: "Daily Expenses", value: totalExpenses, setValue: setTotalExpenses, icon: "credit-card", editable: true },
        ].map(({ label, value, setValue, icon, editable }) => (
          <View style={styles.card} key={label}>
            <Text style={styles.label}><Icon name={icon} size={18} color="#0077b6" /> {label}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
              editable={editable}
              placeholder={`Enter ${label}`}
              placeholderTextColor="#ccc"
            />
          </View>
        ))}

        {calculatedProfitLoss !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.dateText}><Icon name="calendar" size={18} /> {new Date().toLocaleDateString()}</Text>
            <Text style={styles.profitLossText}>Today's Profit or Loss</Text>
            <Text style={[styles.amount, { color: isProfit ? "green" : "red" }]}>
              ₹ {calculatedProfitLoss.toFixed(2)}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleCalculate}>
          <LinearGradient colors={["#001258", "#61A5C2"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>
              <Icon name="calculator" size={18} color="white" /> Calculate
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  scrollContent: { padding: 20 },
  heading: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 10 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, fontSize: 16 },
  resultContainer: { alignItems: "center", marginVertical: 20 },
  dateText: { fontSize: 14, color: "#555" },
  profitLossText: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  amount: { fontSize: 28, fontWeight: "bold", marginTop: 10 },
  button: { marginTop: 20 },
  buttonGradient: { padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ProfitLossScreen;
