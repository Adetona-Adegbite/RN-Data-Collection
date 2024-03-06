import {
  Button,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AddButton from "../components/AddButton";
import {
  useFonts,
  NanumGothic_400Regular,
} from "@expo-google-fonts/nanum-gothic";
import FormCard from "../components/FormCard";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_DB } from "../Firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import uuid from "react-native-uuid";
import OfflineFormCard from "../components/OfflineFormCard";
import { AppLoading } from "expo";

export default function SavedPage() {
  const [fontLoaded] = useFonts({ NanumGothic_400Regular });
  const navigation = useNavigation();
  const [forms, setForms] = useState([]);
  const [userData, setUserData] = useState("");
  const [randomUUID, setRandomUUID] = useState("");

  const [storageResponses, setStoredResponses] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const fetchForms = async () => {
        try {
          const storedForms = await AsyncStorage.getItem("offline-forms");
          let storedResponses = await AsyncStorage.getItem("formResponses");
          setStoredResponses(storedResponses);
          // console.log("Stored Responses", storedResponses);
          if (storedForms) {
            const parsedForms = JSON.parse(storedForms);
            //   console.log(parsedForms);
            setForms(parsedForms);
          }
        } catch (error) {
          console.error("Error fetching forms:", error);
          Alert.alert(
            "Error",
            "Failed to fetch saved forms. Please try again later."
          );
        }
      };

      fetchForms();
      console.log("Page reloaded");
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const fetchForms = async () => {
      try {
        const storedForms = await AsyncStorage.getItem("offline-forms");
        let storedResponses = await AsyncStorage.getItem("formResponses");
        setStoredResponses(storedResponses);
        // console.log("Stored Responses", storedResponses);
        if (storedForms) {
          const parsedForms = JSON.parse(storedForms);
          //   console.log(parsedForms);
          setForms(parsedForms);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        Alert.alert(
          "Error",
          "Failed to fetch saved forms. Please try again later."
        );
      }
    };

    fetchForms();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    async function getUserData() {
      const response = await AsyncStorage.getItem("userData");
      const data = JSON.parse(response);
      //   console.log(data);
      setUserData(data);
    }
    getUserData();
    const uid = uuid.v1();
    setRandomUUID(uid.substr(0, 5));
  }, []);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const storedForms = await AsyncStorage.getItem("offline-forms");
        let storedResponses = await AsyncStorage.getItem("formResponses");
        setStoredResponses(storedResponses);
        // console.log("Stored Responses", storedResponses);
        if (storedForms) {
          const parsedForms = JSON.parse(storedForms);
          //   console.log(parsedForms);
          setForms(parsedForms);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        Alert.alert(
          "Error",
          "Failed to fetch saved forms. Please try again later."
        );
      }
    };

    fetchForms();
  }, []);

  function formPageHandler(item) {
    navigation.navigate("Offline Form Page", { formData: item });
    // console.log("stored responses", storageResponses);
  }
  async function commitHandler(formId) {
    try {
      const db = FIREBASE_DB;

      const form = forms.find((form) => form.id === formId);
      if (!form) {
        console.error(`Form with ID ${formId} not found.`);
        return;
      }

      //   const fiveDigitCode = randomUUID.substr(0, 5);
      const formRef = doc(db, "users", form.creatorId, "forms", form.id);
      await setDoc(formRef, form);
      console.log(`Form with ID ${formId} committed successfully!`);

      // Remove the committed form from AsyncStorage
      const filteredForms = forms.filter((f) => f.id !== formId);
      await AsyncStorage.setItem(
        "offline-forms",
        JSON.stringify(filteredForms)
      );

      navigation.navigate("Home");
    } catch (error) {
      console.error("Error committing saved form:", error);
    }
  }

  async function responseCommitHandler() {
    try {
      const db = FIREBASE_DB;
      //   const randomUUID = uuid.v1();

      const storedResponses = await AsyncStorage.getItem("formResponses");
      const parsedResponses = storedResponses
        ? JSON.parse(storedResponses)
        : [];

      for (const response of parsedResponses) {
        const fiveDigitCode = randomUUID.substr(0, 5);
        console.log(response);
        const { formCreatorId, formId, questions } = response;
        const docRef = doc(
          db,
          "form-submissions",
          formId,
          "user-responses",
          `${userData.uid}${fiveDigitCode.substr(0, 5)}`
        );
        await setDoc(docRef, response);
      }
      console.log("All Responses Successfully Added");
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <>
      {fontLoaded && (
        <SafeAreaView style={styles.page}>
          <View>
            <View style={styles.top}>
              <View style={styles.userInfo}>
                <Text style={[styles.header]}>Offline Section</Text>
              </View>
            </View>
            <View style={styles.hr} />
            <View style={styles.middle}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                Saved Forms
              </Text>
              <AddButton
                onPress={() => {
                  navigation.navigate("Offline Create Form");
                }}
              />
            </View>
            <ScrollView
              style={{ height: "30%", marginTop: 30 }}
              contentContainerStyle={{ alignItems: "center" }}
              refreshControl={
                <RefreshControl
                  tintColor="white"
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#fffffa", "#ffffff"]}
                />
              }
            >
              {forms.map((item) => {
                return (
                  <OfflineFormCard
                    key={item.id}
                    title={item.title}
                    id={item.id}
                    onPress={formPageHandler.bind(this, item)}
                    onCommit={commitHandler.bind(this, item.id)}
                  />
                );
              })}
              <Button
                title="Commit Form Responses"
                onPress={responseCommitHandler}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    padding: 0,
    paddingTop: Platform.OS == "android" && 30,
    backgroundColor: "#161616",
  },
  header: {
    fontFamily: "NanumGothic_400Regular",
    color: "white",
    textAlign: "center",
    fontSize: 30,
  },
  text: {
    fontFamily: "NanumGothic_400Regular",
    color: "white",
    textAlign: "center",
  },
  top: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
  },
  userInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  dp: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: "center",
  },
  middle: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    alignItems: "flex-start",
  },
  hr: {
    borderBottomColor: "#4E4E4E",
    borderBottomWidth: 1,
    marginBottom: 20,
    width: "auto",
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ffffff",
    width: "45%",
    borderRadius: 15,
    paddingVertical: 15,
  },
});
