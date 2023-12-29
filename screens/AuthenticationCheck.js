import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthenticationCheck = () => {
  const navigation = useNavigation();

  useEffect(() => {
    async function checkAsyncStorage() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          navigation.navigate("Main");
        } else {
          navigation.navigate("Register");
        }
      } catch (error) {
        console.error("Error checking AsyncStorage:", error);
      }
    }
    checkAsyncStorage();
  }, []);

  return null;
};

export default AuthenticationCheck;
