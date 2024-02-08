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

export default function FormPage({ route }) {
  const db = FIREBASE_DB;
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
  async function fetchFormSubmissions() {
    try {
      console.log(formData);
      const q = query(
        collection(db, "form-submissions"),
        where("formId", "==", formData.id)
      );
      const querySnapshot = await getDocs(q);
      const submissions = [];
      querySnapshot.forEach((doc) => {
        const submissionData = doc.data();
        submissions.push(submissionData.questions);
      });
      console.log(submissions);
      // setFormSubmissions(submissions);
    } catch (error) {
      console.error("Error fetching form submissions:", error);
    }
  }
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
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  function renderQuestions(question) {
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
      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: option.nativeEvent.text,
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
            <Text style={styles.text}>{question.question}</Text>
            <TextInput
              onChange={(text) => textReponseHandler(question.id, text)}
              style={{ borderWidth: 1, borderColor: "black" }}
            />
          </View>
        );
      case 2: // Long Paragraph
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={{ borderWidth: 1, borderColor: "black" }}
              onChange={(text) => textReponseHandler(question.id, text)}
            />
          </View>
        );
      case 3: // Check Box
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            {question.options.map((option, index) => (
              <View style={styles.option} key={index}>
                <Text style={styles.text}>{option.text}</Text>
                <Checkbox
                  onValueChange={(selected) =>
                    optionResponseHandler(question.id, option, selected)
                  }
                  value={selectedOptions[question.id]?.[option.id] || false}
                />
              </View>
            ))}
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
            <Text style={styles.text}>{formData.description}</Text>
          </View>
          {formData.questions.map((question) => {
            return renderQuestions(question);
          })}
          <Button title="Submit" onPress={submitHandler} />
          <Button title="Query" onPress={fetchFormSubmissions} />
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

  question: {
    // backgroundColor: "yellow",
    width: "75%",
    padding: 20,
  },

  description: {
    width: "60%",
    height: "auto",
    // backgroundColor: "black",
  },
  text: {
    color: "white",
  },
  form: {
    backgroundColor: "red",
    borderRadius: 10,
    width: "90%",
    minHeight: 600,
  },
  formContainer: {
    alignItems: "center",
  },
});
// At6dc5bd7
