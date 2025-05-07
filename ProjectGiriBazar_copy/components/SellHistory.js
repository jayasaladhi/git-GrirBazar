import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  TextInput
} from 'react-native';
import { useTranslation } from 'react-i18next';

const SellHistory = () => {
  const { t } = useTranslation();
  const [sellHistory, setSellHistory] = useState([]);
  const [filteredSellHistory, setFilteredSellHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const BASE_URL = 'http://192.168.137.21:5000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BASE_URL}/getSaleHistory`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        setSellHistory(data);
        setFilteredSellHistory(data);

        const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.price), 0);
        setTotal(totalAmount);
      } catch (error) {
        console.error('Error fetching sell history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = sellHistory.filter(item =>
      item.name?.toLowerCase().includes(text.toLowerCase()) ||
      item.category?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSellHistory(filtered);

    const totalAmount = filtered.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setTotal(totalAmount);
  };

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('sellHistoryTitle')}</Text>

        <TextInput
          style={styles.searchBar}
          placeholder={t('searchPlaceholder') || "Search by product or category"}
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          data={filteredSellHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            if (!item || !item.name) return null;
            return (
              <View style={styles.card}>
                <Text>{t('productLabel')}: {item.name}</Text>
                <Text>{t('categoryLabel')}: {item.category}</Text>
                <Text>{t('quantitySoldLabel')}: {item.quantity}</Text>
                <Text>{t('priceLabel')}: ₹{parseFloat(item.price).toFixed(2)}</Text>
                <Text>{t('dateLabel')}: 🕒 {new Date(item.created_at).toLocaleString()}</Text>
              </View>
            );
          }}
        />

        <Text style={styles.totalText}>
          {t('totalAmountLabel')}: ₹{total.toFixed(2)}
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#0077b6",
    marginLeft: '30%',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 15,
    marginHorizontal: '10%',
    elevation: 3,
  },
  card: {
    backgroundColor: '#caf0f8',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignSelf: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  totalText: {
    color: 'Black',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
});

export default SellHistory;
