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
export default function App() {
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
        <Stack.Screen name="Profile" component={ProfilePage} />
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
