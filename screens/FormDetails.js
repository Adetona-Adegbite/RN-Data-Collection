import { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { FIREBASE_DB } from "../Firebase";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";

export default function FormDetails({ route }) {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    const { params } = route;
    const itemData = params?.item;

    const fetchFormData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const formID = params?.item.formID;
        // console.log(formID);
        const { uid } = JSON.parse(userData);
        // console.log(uid);

        // Assuming 'users' is the collection where each user's data is stored
        const userDocRef = doc(
          FIREBASE_DB,
          "users",
          uid.substring(0, 4),
          "forms",
          formID
        );
        const userFormDocSnapshot = await getDoc(userDocRef);

        if (userFormDocSnapshot.exists()) {
          const fetchedFormData = userFormDocSnapshot.data();
          // setFormData(fetchedFormData);
          const allFormData = {
            title: fetchedFormData.title,
            description: fetchedFormData.description,
            questions: fetchedFormData.questions,
          };
          console.log(allFormData);
          setFormData(allFormData);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    fetchFormData();
  }, []);

  function renderQuestions(question) {
    switch (parseInt(question.questionType)) {
      case 0: // Multiple Choice
        return (
          <View key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            {question.options.map((option, index) => (
              <>
                <Text>{option}</Text>
                <Checkbox key={index} />
              </>
            ))}
          </View>
        );
      case 1: // Short Answer
        return (
          <View key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            <TextInput style={{ borderWidth: 1, borderColor: "black" }} />
          </View>
        );
      case 2: // Long Paragraph
        return (
          <View key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={{ borderWidth: 1, borderColor: "black" }}
            />
          </View>
        );
      case 3: // Check Box
        return (
          <View key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            {question.options.map((option, index) => (
              <>
                <Text style={styles.text}>{option}</Text>
                <Checkbox key={index} />
              </>
            ))}
          </View>
        );
    }
  }
  return (
    <SafeAreaView style={styles.page}>
      {formData && formData.questions && formData.questions.length > 0 ? (
        <>
          <Text style={styles.text}>Form Details</Text>
          {formData.questions.map((question) => {
            return renderQuestions(question);
          })}
        </>
      ) : (
        <Text>No form data available</Text>
      )}
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
  text: {
    color: "white",
  },
});
