import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import InputBox from "../components/InputBox";
import SubmitButton from "../components/SubmitButton";
import OauthButton from "../components/OauthButton";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  NanumGothic_400Regular,
} from "@expo-google-fonts/nanum-gothic";
import { FIREBASE_AUTH, FIREBASE_DB } from "../Firebase";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Signin() {
  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [fontLoaded] = useFonts({ NanumGothic_400Regular });

  async function submitHandler() {
    try {
      setLoading(true);
      const response = await signInWithEmailAndPassword(auth, email, password);
      // const userDocRef = doc(db, "usersData", response.user.uid);
      // await setDoc(userDocRef, {
      //   email: response.user.email,
      // });
      // console.log(response);
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
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password" ||
        e.code == "auth/invalid-credential"
      ) {
        Alert.alert("Invalid email or password. Please try again.");
      } else {
        Alert.alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  function registerHandler() {
    navigation.navigate("Register");
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
                Sign in to create, manage and analyze forms for your business
              </Text>
            </View>
            <InputBox
              secureTextEntry={false}
              placeholder="Email"
              onChangeText={(text) => {
                setEmail(text);
              }}
            />
            <InputBox
              secureTextEntry={true}
              placeholder="Password"
              onChangeText={(text) => {
                setPassword(text);
              }}
            />
            <SubmitButton text="Sign In" onPress={submitHandler} />
            <Text style={styles.text}>Forgot your Password?</Text>
            <Text style={[styles.text, { marginTop: 30 }]}>
              or continue with
            </Text>
            <View style={styles.oauth}>
              <OauthButton text="Google" />
              <OauthButton text="Facebook" />
            </View>

            <Text
              onPress={registerHandler}
              style={[styles.text, { marginTop: 30 }]}
            >
              Don't have an account? Register
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
    color: "white",
    textAlign: "center",
    fontFamily: "NanumGothic_400Regular",
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
    marginTop: 20,
  },
});
