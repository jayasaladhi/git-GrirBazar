import { Text, SafeAreaView, StyleSheet, TouchableOpacity, View ,ImageBackground} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useNavigation } from "@react-navigation/native"; 

export default function Logout() {
  const { t } = useTranslation(); // Use translation hook
  const navigation = useNavigation(); // Fix: Define navigation using the hook

  return (
   <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <Text style={styles.logout}>
        {t('logout')}
      </Text>
      <Text style={styles.paragraph}>
        {t('areyousureyouwanttologout')}
      </Text>
      
      {/* Parent View with flexDirection: 'row' */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => navigation.navigate("Login")} // Ensure navigation works
        >
          <Text style={styles.submitText}>{t('logout')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.navigate("Main")} // Navigates back instead of doing nothing
        >
          <Text style={styles.cancelText}>{t('cancel')}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, 
    resizeMode: "cover", // Ensure the image covers the whole screen
    justifyContent: "center", 
  },
  paragraph: {
    margin: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logout: {
    margin: 10,
    fontSize: 18,
    color: "red",
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#0077B6',
    width: 100,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#0077B6',
    width: 100,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
