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
import { FIREBASE_DB } from "../Firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";

export default function FormDetails({ route }) {
  const [formData, setFormData] = useState({});
  const [formResponses, setFormResponses] = useState([]);
  const [formId, setFormId] = useState("");

  useEffect(() => {
    const { params } = route;
    const itemData = params?.item;

    const fetchFormData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const formID = params?.item.formID;
        setFormId(formID);
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
          // console.log(allFormData.questions[0].options);
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
  async function fetchFormSubmissions() {
    try {
      const q = query(
        collection(FIREBASE_DB, "form-submissions"),
        where("formId", "==", formId)
      );
      const querySnapshot = await getDocs(q);
      const submissions = [];

      querySnapshot.forEach((doc) => {
        const submissionData = doc.data();
        submissions.push(submissionData.questions);
      });
      // console.log("submissi?Son data", submissions);

      // setFormResponses(formattedResponses);
      // console.log(formResponses);
      const formattedData = [];
      submissions.forEach((response) => {
        response.forEach((item) => {
          formattedData.push({
            questionNumber: item.questionId,
            question: item.question,
            options: item.options || "",
            response: item.response,
          });
        });
      });
      // console.log(formattedData);

      const structuredResponses = formattedData.map((question) => {
        const responses = question.response;
        const responseCounts = {};

        if (Array.isArray(question.options)) {
          question.options.forEach((option) => {
            responseCounts[option.text] = 0;
          });
        }

        if (responses instanceof Object) {
          Object.keys(responses).forEach((optionId) => {
            if (responses[optionId]) {
              const selectedOption = question.options.find(
                (option) => option.id.toString() === optionId
              );
              if (selectedOption) {
                responseCounts[selectedOption.text] += 1;
              }
            }
          });
        } else if (typeof responses === "string") {
          if (responseCounts[responses] !== undefined) {
            responseCounts[responses] += 1;
          } else {
            responseCounts[responses] = 1;
          }
        }

        return {
          question: question.question,
          responseCounts: responseCounts,
        };
      });

      console.log(structuredResponses);
    } catch (error) {
      console.error("Error fetching form submissions:", error);
    }
  }

  function renderQuestions(question) {
    switch (parseInt(question.questionType)) {
      case 0: // Multiple Choice
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            <View style={styles.optionBox}>
              {question.options.map((option, index) => (
                <View style={styles.option}>
                  <Text key={index}>{option.text}</Text>
                  <Checkbox key={index + 1} />
                </View>
              ))}
            </View>
          </View>
        );
      case 1: // Short Answer
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            <TextInput style={{ borderWidth: 1, borderColor: "black" }} />
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
            />
          </View>
        );
      case 3: // Check Box
        return (
          <View style={styles.question} key={question.id}>
            <Text style={styles.text}>{question.question}</Text>
            {question.options.map((option, index) => (
              <>
                <Text style={styles.text}>{option.text}</Text>
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
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContainer}
        >
          <Button title="Query Data " onPress={fetchFormSubmissions} />
          <Text style={styles.title}>{formData.title}</Text>
          <View style={styles.description}>
            <Text style={styles.text}>{formData.description}</Text>
          </View>
          {formData.questions.map((question) => {
            return renderQuestions(question);
          })}
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
