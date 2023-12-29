import { Alert, SafeAreaView, Text } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import InputBox from "../components/InputBox";
import SubmitButton from "../components/SubmitButton";
import OauthButton from "../components/OauthButton";
import {
  useFonts,
  NanumGothic_400Regular,
} from "@expo-google-fonts/nanum-gothic";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../Firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const navigation = useNavigation();
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  const [fontLoaded] = useFonts({ NanumGothic_400Regular });
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [loading, setLoading] = useState(false);
  async function registerHandler() {
    if (password == confirmPassword) {
      try {
        setLoading(true);
        console.log(email);
        const response = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(response);

        // Access Firestore and store additional user data
        const userDocRef = doc(db, "users", response.user.uid.substring(0, 4));
        await setDoc(userDocRef, {
          email: response.user.email,
          username: username,
        });
        AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            uid: response.user.uid.substring(0, 4),
            email: response.user.email,
          })
        );
        navigation.navigate("Main");
      } catch (e) {
        console.log(e);
        if (e.code === "auth/email-already-in-use") {
          Alert.alert("Email already in use. Please use a different email.");
        } else if (e.code === "auth/weak-password") {
          Alert.alert(
            "Password is too weak. Please choose a stronger password."
          );
        } else {
          Alert.alert("Registration failed:", error);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setPasswordMatchError(true);
    }
  }

  function signInHandler() {
    navigation.navigate("Signin");
  }
  return (
    <>
      {loading ? (
        <SafeAreaView style={[styles.page, { justifyContent: "center" }]}>
          <Text style={{ color: "white", fontSize: 32 }}>Loading...</Text>
        </SafeAreaView>
      ) : (
        fontLoaded && (
          <SafeAreaView style={styles.page}>
            <Text style={[styles.text, styles.header]}>
              Welcome to FormsApp
            </Text>
            <View style={{ width: "70%", marginTop: 30 }}>
              <Text style={[styles.text, { marginBottom: 20 }]}>
                Register to create, manage and analyze forms for your business
              </Text>
            </View>
            {passwordMatchError && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            <InputBox
              secureTextEntry={false}
              placeholder="Username"
              onChangeText={(text) => setUsername(text)}
            />
            <InputBox
              secureTextEntry={false}
              placeholder="Email"
              onChangeText={(text) => setEmail(text)}
            />
            <InputBox
              secureTextEntry={true}
              placeholder="Password"
              onChangeText={(text) => setPassword(text)}
            />
            <InputBox
              secureTextEntry={true}
              placeholder="Retype Password"
              onChangeText={(text) => {
                setConfirmPassword(text);
                setPasswordMatchError(false);
              }}
            />

            <SubmitButton text="Register" onPress={registerHandler} />
            <Text style={styles.text}>or register with</Text>
            <View style={styles.oauth}>
              <OauthButton text="Google" />
              <OauthButton text="Facebook" />
            </View>
            <Text
              onPress={signInHandler}
              style={[styles.text, { marginTop: 30 }]}
            >
              Already have an account? Signin
            </Text>
          </SafeAreaView>
        )
      )}
    </>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#161616",
  },
  text: {
    fontFamily: "NanumGothic_400Regular",
    color: "white",
    textAlign: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
  },
  oauth: {
    flexDirection: "row",
    width: "75%",
    justifyContent: "space-between",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});
