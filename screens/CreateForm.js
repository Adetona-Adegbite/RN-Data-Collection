import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Picker,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import QuestionCard from "../components/QuestionCard";
import { Checkbox } from "react-native-paper";
import Checkboxlist from "../components/CheckBox";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../Firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { useNavigation } from "@react-navigation/native";
import InputBox from "../components/InputBox";
import AddButton from "../components/AddButton";
import NetInfo from "@react-native-community/netinfo";

const db = FIREBASE_DB;

const FormCreationPage = () => {
  const navigation = useNavigation();
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [userData, setUserData] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    async function getUserData() {
      const response = await AsyncStorage.getItem("userData");
      const data = JSON.parse(response);
      console.log(data);
      setUserData(data);
    }
    getUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      console.log("offline state", state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  async function submitForm() {
    if (!isConnected) {
      console.log("offline");
      const randomUUID = uuid.v1();
      const fiveDigitCode = randomUUID.substr(0, 5);

      try {
        const offlineFormData = {
          id: userData.uid + fiveDigitCode,
          creatorId: userData.uid,
          title: formTitle,
          description: formDescription,
          questions: questions,
        };
        await AsyncStorage.setItem(
          "offlineFormData",
          JSON.stringify(offlineFormData)
        );
        Alert.alert(
          "Form data saved offline",
          "Please submit the form when you are online."
        );
      } catch (error) {
        console.error("Error saving form data offline:", error);
      }
    } else {
      const randomUUID = uuid.v1();
      try {
        const fiveDigitCode = randomUUID.substr(0, 5);
        const formRef = doc(
          db,
          "users",
          userData.uid,
          "forms",
          userData.uid + fiveDigitCode
        );
        const formDoc = {
          id: userData.uid + fiveDigitCode,
          creatorId: userData.uid,
          title: formTitle,
          description: formDescription,
          questions: questions,
        };
        const response = await setDoc(
          formRef,
          JSON.parse(JSON.stringify(formDoc))
        );
        console.log(response);
        navigation.navigate("Home");
      } catch (e) {
        console.log(e);
      }
    }
  }

  function addHandler(question, id) {
    if (question) {
      const existingIndex = questions.findIndex((q) => q.id === id);
      if (existingIndex !== -1) {
        setQuestions((oldQuestions) => {
          const updatedQuestions = [...oldQuestions];
          updatedQuestions[existingIndex] = { ...question, id: id };
          return updatedQuestions;
        });
      } else {
        setQuestions((oldQuestions) => [
          ...oldQuestions,
          { ...question, id: id },
        ]);
      }
    }
  }

  useEffect(() => {
    console.log(questions);
  }, [questions]);

  function newQuestionHandler() {
    setNumberOfQuestions((prevCount) => prevCount + 1);
  }

  return (
    <SafeAreaView style={styles.page}>
      <Text style={{ color: "white", fontSize: 32, padding: 10 }}>
        Create Form
      </Text>
      <InputBox
        placeholder="Enter Form Title"
        value={formTitle}
        onChangeText={setFormTitle}
        padding={15}
        Xstyles={{ marginTop: 20 }}
      />
      <InputBox
        placeholder="Enter Form Description"
        value={formDescription}
        onChangeText={setFormDescription}
        padding={15}
      />

      <AddButton onPress={newQuestionHandler} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {Array.from({ length: numberOfQuestions }, (_, index) => (
          <QuestionCard
            key={index}
            onAdd={(question) => addHandler(question, index)}
          />
        ))}
      </ScrollView>
      <Button title="Create Form" onPress={submitForm} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    padding: 40,
    backgroundColor: "#161616",
  },
  scrollView: {
    width: "100%",
    height: "100%",
    marginTop: 10,
  },
});

export default FormCreationPage;
