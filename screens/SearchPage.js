import { Alert, SafeAreaView, StyleSheet, Text } from "react-native";
import InputBox from "../components/InputBox";
import SearchButton from "../components/SearchButton";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../Firebase";

export default function SearchPage() {
  const [formCode, setFormCode] = useState("");
  const [errorMessage, setErrorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  async function formSearch() {
    if (formCode == "") {
      setErrorCode("Input can't be empty");
      Alert.alert(errorMessage);

      return;
    } else if (formCode.length !== 9) {
      setErrorCode("Code has to be 9 characters long");
      Alert.alert(errorMessage);

      return;
    } else {
      try {
        // Splitting the formCode into userUID and formID
        setLoading(true);
        const userUID = formCode.substring(0, 4);
        const formID = formCode.substring(4);
        const userFormDocRef = doc(
          FIREBASE_DB,
          "users",
          userUID,
          "forms",
          userUID + formID
        );
        console.log("User UID:", userUID);
        console.log("Form ID:", formID);

        const userFormDocSnapshot = await getDoc(userFormDocRef);

        if (userFormDocSnapshot.exists()) {
          const formData = userFormDocSnapshot.data();
          // console.log("Form Data:", formData);
          navigation.navigate("Form Page", { formData: formData }); // Pass formData to FormDetails
        } else {
          setErrorCode("Form not found");
          console.log("No such document!");
        }
      } catch (error) {
        setErrorCode("Error fetching form data");
        console.error("Error fetching form data:", error);
        Alert.alert(errorMessage);
      } finally {
        setFormCode("");
      }
    }
  }
  return (
    <SafeAreaView style={styles.page}>
      {!loading ? (
        <>
          <Text style={[styles.title, { marginTop: 40 }]}>Enter Form Code</Text>
          <InputBox
            placeholder="e.g 12345"
            onChangeText={(text) => setFormCode(text)}
            value={formCode}
          />
          <SearchButton onPress={formSearch} />
        </>
      ) : (
        <>
          <Text style={{ color: "white", fontSize: 32 }}>Loading...</Text>
          {errorMessage && <Text>{errorMessage}</Text>}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#161616",
  },
  title: {
    fontFamily: "NanumGothic_400Regular",
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
});
