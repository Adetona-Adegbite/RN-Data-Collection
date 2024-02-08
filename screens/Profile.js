import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, SafeAreaView, StyleSheet, View } from "react-native";
import * as Updates from "expo-updates";
export default function ProfilePage({ navigation }) {
  async function logoutHandler() {
    AsyncStorage.clear();
    navigation.navigate("Home");
    // await Updates.reloadAsync();
  }
  return (
    <SafeAreaView style={styles.page}>
      <Button title="Logout" onPress={logoutHandler} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    padding: 40,
    backgroundColor: "#161616",
  },
});
