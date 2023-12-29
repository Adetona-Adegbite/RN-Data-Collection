import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AddButton from "../components/AddButton";
import {
  useFonts,
  NanumGothic_400Regular,
} from "@expo-google-fonts/nanum-gothic";
import FormCard from "../components/FormCard";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_DB } from "../Firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [forms, setForms] = useState([]);
  // console.log(forms);
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData !== null) {
          // console.log(userData);
          const { uid } = JSON.parse(userData);
          // setUsername(username);
          // console.log(username);
          const userDocRef = doc(FIREBASE_DB, "users", uid.substring(0, 4));
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            // console.log(userData);
            setUsername(userData.username);
          }
        }
      } catch (error) {
        console.log("Error fetching username:", error);
      }
    };
    async function fetchForms() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData !== null) {
          const { uid } = JSON.parse(userData);
          const userDocRef = doc(FIREBASE_DB, "users", uid.substring(0, 4));

          const userDocSnapshot = await getDoc(userDocRef);
          // console.log(userDocSnapshot.data());
          if (userDocSnapshot.exists()) {
            const formsCollectionRef = collection(userDocRef, "forms");
            const formsSnapshot = await getDocs(formsCollectionRef);

            const fetchedForms = [];
            formsSnapshot.forEach((doc) => {
              fetchedForms.push({
                formID: doc.id,
                title: doc.data().title,
                // Other form data you want to retrieve
              });
            });
            // console.log(fetchedForms);
            setForms(fetchedForms);
          } else {
            console.log("User document does not exist");
          }
        }
      } catch (error) {
        console.log("Error fetching forms:", error);
      }
    }
    fetchUsername();
    fetchForms();
  }, []);
  const navigation = useNavigation();
  function formDetailsHandler(item) {
    navigation.navigate("Form Details", { item: item });
  }
  const [fontLoaded] = useFonts({ NanumGothic_400Regular });

  return (
    <>
      {fontLoaded && (
        <SafeAreaView style={styles.page}>
          <View>
            <View style={styles.top}>
              <View style={styles.userInfo}>
                <Text
                  style={[
                    styles.text,
                    { fontWeight: "bold", fontSize: 25, marginBottom: 10 },
                  ]}
                >
                  Welcome {username}
                </Text>
                <Text style={[styles.text]}>Create and Manage Forms</Text>
              </View>
              <View style={styles.dp}>
                <Text
                  style={[
                    { textAlign: "center", fontSize: 32, fontWeight: "100" },
                  ]}
                >
                  {username[0]}
                </Text>
              </View>
            </View>
            <View style={styles.hr} />
            <View style={styles.middle}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                Your Forms
              </Text>
              <AddButton
                onPress={() => {
                  navigation.navigate("Create Form");
                }}
              />
            </View>
            <ScrollView
              style={{ height: "30%", marginTop: 30 }}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {forms.map((item) => {
                return (
                  <FormCard
                    key={item.id}
                    title={item.title}
                    id={item.formID}
                    onPress={formDetailsHandler.bind(this, item)}
                  />
                );
              })}
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
    padding: 40,
    backgroundColor: "#161616",
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
});
