import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchPage from "./screens/SearchPage";
import HomePage from "./screens/HomePage";
import ProfilePage from "./screens/Profile";
import CreateForm from "./screens/CreateForm";
import FormDetails from "./screens/FormDetails";
import Register from "./screens/Register";
import Signin from "./screens/Signin";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthenticationCheck from "./screens/AuthenticationCheck";
import { PaperProvider } from "react-native-paper";
import FormPage from "./screens/FormPage";
import NetInfo from "@react-native-community/netinfo";

export default function App() {
  // AsyncStorage.clear();
  useEffect(() => {
    const checkFormDataAndUpload = async () => {
      // Check AsyncStorage for stored form data
      const formData = await AsyncStorage.getItem("formData");
      if (formData) {
        // Check internet connectivity
        const netInfoState = await NetInfo.fetch();
        if (netInfoState.isConnected) {
          // Upload formData to database
          try {
            const response = await db
              .collection("formData")
              .add(JSON.parse(formData));
            console.log("Form data uploaded successfully:", response);
            // Clear AsyncStorage after successful upload
            await AsyncStorage.removeItem("formData");
          } catch (error) {
            console.error("Error uploading form data:", error);
            Alert.alert(
              "Error",
              "Failed to upload form data. Please try again later."
            );
          }
        } else {
          // User is offline, display a message or store the data locally for later upload
          Alert.alert(
            "No Internet",
            "You are offline. Form data will be uploaded once you are connected to the internet."
          );
        }
      }
    };

    // Call the function on app startup
    checkFormDataAndUpload();
  }, []);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        console.log("No internet");
        const navigation = useNavigation();
        navigation.navigate("Create Form");
      }
    });

    return () => unsubscribe();
  }, []);
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  function StackScreen() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen
          name="Profile"
          component={ProfilePage}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          options={{ presentation: "modal" }}
          name="Create Form"
          component={CreateForm}
        />
        <Stack.Screen name="Form Details" component={FormDetails} />
        <Stack.Screen name="Form Page" component={FormPage} />
      </Stack.Navigator>
    );
  }
  function BottomTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#333",
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: "white",
          headerShown: false,
        }}
      >
        <Tab.Screen name="Create" component={StackScreen} />
        <Tab.Screen name="Search" component={SearchPage} />
      </Tab.Navigator>
    );
  }
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="AuthCheck" component={AuthenticationCheck} />

          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Signin" component={Signin} />
          <Stack.Screen name="Main" component={BottomTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
