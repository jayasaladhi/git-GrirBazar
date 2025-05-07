import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Alert, ImageBackground, KeyboardAvoidingView, Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';


export default function AddProductCategory() {
  const { t } = useTranslation();

  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Price Card States
  const [priceCategory, setPriceCategory] = useState('');
  const [filteredPriceCategories, setFilteredPriceCategories] = useState([]);
  const [showPriceCategorySuggestions, setShowPriceCategorySuggestions] = useState(false);

  const [priceProduct, setPriceProduct] = useState('');
  const [filteredProductsForPrice, setFilteredProductsForPrice] = useState([]);
  const [showPriceProductSuggestions, setShowPriceProductSuggestions] = useState(false);
  const [price, setPrice] = useState('');

  const BASE_URL = 'http://192.168.137.21:5000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories`);
      const data = await response.json();

      if (response.status === 200) {
        setCategories(data.categories);

        const productRes = await fetch(`${BASE_URL}/getAllProducts`);
        const productData = await productRes.json();

        if (productRes.status === 200) {
          setProducts(productData.products); // { category: [products] }
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), 'Server error');
    }
  };

  const handleAddCategory = async () => {
    const trimmed = category.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('error'), t('enterCategoryPlaceholder'));
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/addCategory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: trimmed })
      });

      const data = await response.json();
      if (response.status === 201) {
        setCategories([...categories, trimmed]);
        setCategory('');
        showToast('success', 'Category Added', `${trimmed} added successfully`);
      } else {
        Alert.alert(t('error'), data.message || 'Error adding category');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), 'Server error');
    }
  };

  const handleAddProduct = async () => {
    const trimmedProduct = productName.trim();
    const trimmedCategory = selectedCategory.trim();

    if (!trimmedCategory || !trimmedProduct) {
      Alert.alert(t('error'), t('selectCategoryAndProduct'));
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/addProduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: trimmedCategory,
          product: trimmedProduct
        })
      });

      const data = await response.json();

      if (response.status === 201) {
        setProducts(prev => ({
          ...prev,
          [trimmedCategory]: [...(prev[trimmedCategory] || []), trimmedProduct]
        }));

        setProductName('');
        setSelectedCategory('');
        showToast('success', 'Product Added', `${trimmedProduct} added to ${trimmedCategory}`);
      } else {
        Alert.alert(t('error'), data.message || 'Error adding product');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), 'Server error');
    }
  };

  const handleSetPrice = async () => {
    if (!priceCategory || !priceProduct || !price) {
      Alert.alert(t('error'), 'Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/setPrice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: priceCategory.trim(),
          product: priceProduct.trim(),
          price: parseFloat(price)
        })
      });

      const data = await response.json();

      if (response.status === 201) {
        showToast('success', 'Price Set', `${priceProduct} = ₹${price}`);
        setPriceCategory('');
        setPriceProduct('');
        setPrice('');
      } else {
        const title = data.message?.toLowerCase().includes('successfully') ? '' : t('error');
        Alert.alert(title, data.message || 'Error setting price');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), 'Server error');
    }
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 50,
    });
  };

  const handleCategorySearch = (text) => {
    setSelectedCategory(text);
    if (text.trim()) {
      const filtered = categories.filter(cat =>
        cat.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectCategory = (item) => {
    setSelectedCategory(item);
    setShowSuggestions(false);
  };

  const handlePriceCategorySearch = (text) => {
    setPriceCategory(text);
    const filtered = categories.filter(cat =>
      cat.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPriceCategories(filtered);
    setShowPriceCategorySuggestions(true);
    setPriceProduct('');
    setFilteredProductsForPrice([]);
  };

  const handleSelectPriceCategory = (item) => {
    setPriceCategory(item);
    setFilteredProductsForPrice(products[item] || []);
    setShowPriceCategorySuggestions(false);
  };

  const handlePriceProductSearch = (text) => {
    setPriceProduct(text);
    const category = priceCategory.trim();
    if (!category || !products?.[category]) return;

    const filtered = products[category].filter(p =>
      p.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProductsForPrice(filtered);
    setShowPriceProductSuggestions(true);
  };

  const handleSelectPriceProduct = (item) => {
    setPriceProduct(item);
    setShowPriceProductSuggestions(false);
  };

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <FlatList
          data={[{}]} // just a dummy data array for now, replace with actual content structure
          renderItem={() => (
            <View style={styles.container}>
              {/* Add Category Card */}
              <Animated.View entering={FadeInUp.delay(100)} style={styles.card}>
                <Text style={styles.title}>{t('addCategoryTitle')}</Text>
                <TextInput
                  placeholder={t('enterCategoryPlaceholder')}
                  value={category}
                  onChangeText={setCategory}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
                  <Text style={styles.buttonText}>{t('addCategoryButton')}</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Add Product Card */}
              <Animated.View entering={FadeInUp.delay(250)} style={styles.card}>
                <Text style={styles.title}>{t('addProductTitle')}</Text>
                <TextInput
                  placeholder={t('searchCategoryPlaceholder')}
                  value={selectedCategory}
                  onChangeText={handleCategorySearch}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                {showSuggestions && (
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    style={{ maxHeight: 150, marginBottom: 10 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectCategory(item)}>
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                <TextInput
                  placeholder={t('enterProductNamePlaceholder')}
                  value={productName}
                  onChangeText={setProductName}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
                  <Text style={styles.buttonText}>{t('addProductButton')}</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Set Price Card */}
              <Animated.View entering={FadeInUp.delay(400)} style={styles.card}>
                <Text style={styles.title}>Set Price per Unit</Text>

                <TextInput
                  placeholder="Search Category"
                  value={priceCategory}
                  onChangeText={handlePriceCategorySearch}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                {showPriceCategorySuggestions && (
                  <FlatList
                    data={filteredPriceCategories}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    style={{ maxHeight: 150, marginBottom: 10 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectPriceCategory(item)}>
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                <TextInput
                  placeholder="Search Product"
                  value={priceProduct}
                  onChangeText={handlePriceProductSearch}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                {showPriceProductSuggestions && (
                  <FlatList
                    data={filteredProductsForPrice}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    style={{ maxHeight: 150, marginBottom: 10 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectPriceProduct(item)}>
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                <TextInput
                  placeholder="Enter Price per Unit"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />

                <TouchableOpacity style={styles.button} onPress={handleSetPrice}>
                  <Text style={styles.buttonText}>Set Price</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
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
    padding: 30,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    height: 45, 
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  suggestionBox: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    zIndex: 10,
    maxHeight: 160,
  },
  suggestionItem: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  
  suggestionText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500'
  },
  
  // suggestionItem: {
  //   padding: 12,
  //   borderBottomColor: '#eee',
  //   borderBottomWidth: 1,
  // },
  // suggestionText: {
  //   fontSize: 16,
  //   color: '#333',
  // },
});
