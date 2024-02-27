import { useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Checkbox from "expo-checkbox";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { FIREBASE_DB } from "../Firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function FormPage({ route }) {
  const db = FIREBASE_DB;
  const navigation = useNavigation();
  const [uid, setUid] = useState("");
  const [formData, setFormData] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  useLayoutEffect(() => {
    async function preLoad() {
      const userData = await AsyncStorage.getItem("userData");
      const { uid } = JSON.parse(userData);
      setUid(uid);
      console.log(uid);
      AsyncStorage.getItem("userData");
      const { params } = route;
      console.log(params);
      const data = params?.formData;
      setFormData(data);
    }
    preLoad();
  }, []);
  // async function fetchFormSubmissions() {
  //   try {
  //     console.log(formData);
  //     const formSubmissionsRef = doc(
  //       db,
  //       "form-submissions",
  //       formData.id,
  //       "user-responses"
  //     );
  //     const querySnapshot = await getDocs(collection(formSubmissionsRef));
  //     const submissions = [];
  //     querySnapshot.forEach((doc) => {
  //       const submissionData = doc.data();
  //       submissions.push(submissionData);
  //     });
  //     console.log(submissions);
  //     // setFormSubmissions(submissions);
  //   } catch (error) {
  //     console.error("Error fetching form submissions:", error);
  //   }
  // }
  async function submitHandler() {
    const payload = {
      formCreatorId: formData.creatorId,
      formId: formData.id,
      questions: formData.questions.map((question) => ({
        questionId: question.id,
        question: question.question,
        options: question.options,
        response: selectedOptions[question.id],
      })),
    };
    // console.log(payload);
    // console.log(formData);
    try {
      const docRef = doc(
        db,
        "form-submissions",
        formData.id,
        "user-responses",
        uid
      );
      await setDoc(docRef, payload);
      console.log("Form submitted successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  function renderQuestions(question, number) {
    function optionResponseHandler(questionId, option, selected) {
      // console.log(option);
      console.log(selected);
      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          [option.id]: selected,
        },
      }));
      // console.log(selectedOptions);
    }

    function textReponseHandler(questionId, option) {
      console.log(option);
      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: option,
      }));
      console.log(selectedOptions);
    }
    // const formDataDocRef = doc(db, "form-data", FORM_ID,)
    // await setDoc(formDataDocRef, {
    //   FORM_QUESTIONS_AND_ANWERS_DATA
    // })

    switch (parseInt(question.questionType)) {
      case 0: // Multiple Choice
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.number}>{number}</Text>

            <Text style={styles.text}>{question.question}</Text>
            <View style={styles.optionBox}>
              {question.options.map((option, index) => (
                <View style={styles.option} key={index}>
                  <Text>{option.text}</Text>
                  <Checkbox
                    onValueChange={(selected) =>
                      optionResponseHandler(question.id, option, selected)
                    }
                    value={selectedOptions[question.id]?.[option.id] || false}
                  />
                </View>
              ))}
            </View>
          </View>
        );
      case 1: // Short Answer
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.number}>{number}</Text>

            <Text style={styles.text}>{question.question}</Text>
            <TextInput
              onChangeText={(text) => textReponseHandler(question.id, text)}
              style={styles.inputBox}
            />
          </View>
        );
      case 2: // Long Paragraph
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.number}>{number}</Text>

            <Text style={styles.text}>{question.question}</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={styles.inputBox}
              onChangeText={(text) => textReponseHandler(question.id, text)}
            />
          </View>
        );
      case 3: // Check Box
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.number}>{number}</Text>

            <Text style={styles.text}>{question.question}</Text>
            <View style={styles.optionBox}>
              {question.options.map((option, index) => (
                <View style={styles.option} key={index}>
                  <Text>{option.text}</Text>
                  <Checkbox
                    onValueChange={(selected) =>
                      optionResponseHandler(question.id, option, selected)
                    }
                    value={selectedOptions[question.id]?.[option.id] || false}
                  />
                </View>
              ))}
            </View>
          </View>
        );
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      {formData && formData.questions && formData.questions.length > 0 ? (
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContainer}
        >
          <Text style={styles.title}>{formData.title}</Text>
          <View style={styles.description}>
            <Text style={styles.descriptionText}>{formData.description}</Text>
          </View>
          {formData.questions.map((question, index) => {
            return renderQuestions(question, index + 1);
          })}
          <Button title="Submit" onPress={submitHandler} />
          {/* <Button title="Query" onPress={fetchFormSubmissions} /> */}
        </ScrollView>
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
  title: {
    fontSize: 54,
    color: "white",
  },
  optionBox: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 20,
  },
  option: {
    width: "48%",
  },
  number: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  question: {
    width: "75%",
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#DFE4E6",
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  description: {
    width: "60%",
    height: "auto",
    marginBottom: 50,
  },
  descriptionText: {
    color: "white",
  },
  text: {
    color: "black",
    fontSize: 18,
  },
  inputBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    width: "75%",
    borderRadius: 25,
    marginBottom: 20,
    marginTop: 10,
    padding: 6,
  },
  form: {
    backgroundColor: "#859982",
    borderRadius: 10,
    width: "90%",
    minHeight: 600,
    marginTop: 20,
  },
  formContainer: {
    alignItems: "center",
  },
});
// At6dc5bd7
