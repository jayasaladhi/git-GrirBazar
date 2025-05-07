import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions,
  LayoutAnimation, UIManager, Platform, ToastAndroid, ImageBackground,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get("window").width;

export default function Inventory() {
  const [submittedData, setSubmittedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [])
  );

  const loadInventory = async () => {
    try {
      const response = await fetch('http://192.168.137.21:5000/getProductInventory');
      const data = await response.json();

      if (Array.isArray(data)) {
        const inventoryData = data.map(item => ({
          product: item.product || 'Unknown Product',
          category: item.category || 'Unknown Category',
          quantity: parseFloat(item.quantity || 0),
          unitPrice: parseFloat(item.unitPrice || 0),
        }));
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSubmittedData(inventoryData);
        ToastAndroid.show("Inventory updated", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Error loading inventory:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInventory().then(() => setRefreshing(false));
  }, []);

  const filteredData = selectedCategory === 'All'
    ? submittedData
    : submittedData.filter(item => item.category === selectedCategory);

  const aggregatedData = filteredData.reduce((acc, item) => {
    const key = item.product?.toString() || 'Unknown';
    if (!acc[key]) acc[key] = { quantity: 0 };
    acc[key].quantity += item.quantity;
    return acc;
  }, {});

  const labels = Object.keys(aggregatedData);
  let values = Object.values(aggregatedData).map(obj => obj.quantity);

  if (labels.length === 1) {
    labels.push('');
    values.push(0);
  }

  const chartData = values;

  const getBarColors = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#3A86FF', '#FFD166', '#8338EC', '#06D6A0', '#EF476F', '#00BFFF', '#FF6347', '#FFD700'];
    return colors[index % colors.length];
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    barPercentage: 0.9,
    categoryPercentage: 0.5,
    labelColor: () => "#333",
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    propsForLabels: {
      fontSize: 13,
      fontWeight: 'bold',
    },
    propsForBackgroundLines: {
      stroke: "#ddd",
      strokeDasharray: "",
    },
  };

  const uniqueCategories = ['All', ...new Set(submittedData.map(item => item.category))];

  const getCurrentDate = () => {
    const today = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(today);
  };

  const isLowStock = (qty) => qty <= 20;

  return (
    <ImageBackground
      source={require("../assets/background2.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 📅 Date in Decorative Banner */}
        <Text style={styles.dateText}> {getCurrentDate()}</Text>

        <Text style={styles.title}>📊 Inventory Quantity Overview</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {uniqueCategories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </View>

        {/* 📊 BarChart section */}
        {labels.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            <BarChart
              data={{
                labels: labels,
                datasets: [
                  {
                    data: chartData,
                    colors: chartData.map((_, i) => () => getBarColors(i)),
                  }
                ],
              }}
              width={Math.max(screenWidth, labels.length * 90)}
              height={280}
              fromZero
              showValuesOnTopOfBars
              withCustomBarColorFromData
              flatColor={false}
              verticalLabelRotation={0}
              chartConfig={chartConfig}
              style={styles.chart}
              barRadius={6}
            />
          </ScrollView>
        ) : (
          <Text style={styles.noData}>No inventory data available.</Text>
        )}

        {/* 🧾 Cards */}
        <View style={styles.cardContainer}>
          {filteredData.map((item, index) => {
            const totalPrice = item.quantity * item.unitPrice;
            return (
              <View key={index} style={[styles.card, { borderColor: getBarColors(index), borderWidth: 2 }]}>
                <Text style={styles.cardTitle}>{item.product}</Text>
                <Text style={styles.cardText}>Category: {item.category}</Text>
                <Text style={styles.cardText}>
                  Quantity: {item.quantity} {isLowStock(item.quantity) && <Text style={styles.warning}>⚠️</Text>}
                </Text>
                <Text style={styles.cardText}>Total Price: ₹{totalPrice.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4B86B2', // Background color for the date banner
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#023047',
  },
  pickerContainer: {
    width: '80%',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chart: {
    marginVertical: 40,
    borderRadius: 29,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  noData: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 20,
    width: '100%',
  },
  card: {
    width: '48%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ccc',
    elevation: 5,
    marginHorizontal: '1%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
  },
  warning: {
    fontSize: 16,
    color: 'red',
    marginLeft: 6,
  },
});
