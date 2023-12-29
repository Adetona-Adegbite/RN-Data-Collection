import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
// import { v4 } from "uuid";

export default function ({ onAdd, questions }) {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState(0);
  const [numberOfChoices, setNumberOfChoices] = useState(2);
  const [optionsData, setOptionsData] = useState([]); // This array would contain all information on all the questions arranged in objects each
  const [allData, setAllData] = useState([]);
  const [questionAdded, setQuestionAdded] = useState(false);

  function optionsCreationHandler(text, index) {
    let newOptionsData = [...optionsData];
    newOptionsData[index] = text;
    setOptionsData([...newOptionsData]);
  }

  function addHandler() {
    if (question) {
      const exists = allData.some((data) => data.question === question);
      if (!exists) {
        const id = allData.length;
        setAllData((prevData) => [
          ...prevData,
          {
            id: id,
            question: question,
            questionType: questionType,
            options: optionsData,
          },
        ]);
        onAdd({
          id: id,
          question: question,
          questionType: questionType,
          options: optionsData,
        });
        setQuestionAdded(true);
      } else {
      }
    }
  }
  // useEffect(() => {
  //   console.log(allData);
  // }, [allData]);
  const createArrayOfSize = (size) => {
    return Array.from({ length: size }, (_, index) => index);
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Title"
        onChangeText={(text) => setQuestion(text)}
      />
      <Text>Question Type</Text>
      <Picker
        mode="dropdown"
        style={styles.picker}
        selectedValue={questionType}
        onValueChange={(value) => {
          setQuestionType(value);
          // console.log(questionType);
        }}
      >
        <Picker.Item label="Multiple Choice" value={0} />
        <Picker.Item label="Short Answer" value={1} />
        <Picker.Item label="Paragraph" value={2} />
        <Picker.Item label="Checkbox" value={3} />
      </Picker>
      <Text>{questionType == 0 ? "Multiple Choice " : "Other"}</Text>
      <TextInput
        defaultValue="2"
        keyboardType="numeric"
        onChangeText={(text) => setNumberOfChoices(parseInt(text))}
      />
      {createArrayOfSize(numberOfChoices).map((index) => {
        return (
          <TextInput
            key={index}
            placeholder={`Input ${index + 1}`}
            onChangeText={(text) => optionsCreationHandler(text, index)}
          />
        );
      })}
      <Button title="Add" onPress={addHandler} />

      {questionAdded && <Text>Added</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "85%",
    height: 300,
    alignItems: "center",
    backgroundColor: "red",
  },
  picker: {
    backgroundColor: "green",
    width: "60%",
    height: 100,
    justifyContent: "center",
    overflow: "hidden",
  },
});
