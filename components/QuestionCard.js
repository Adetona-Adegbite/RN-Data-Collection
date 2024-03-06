import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
// import { v4 } from "uuid";

export default function ({ onAdd, questions, onRemove }) {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState(0);
  const [numberOfChoices, setNumberOfChoices] = useState(2);
  const [optionsData, setOptionsData] = useState([]); // This array would contain all information on all the questions arranged in objects each
  const [allData, setAllData] = useState([]);
  const [questionAdded, setQuestionAdded] = useState(false);
  const [show, setShow] = useState(true);

  function optionsCreationHandler(text, index) {
    setOptionsData((prevOptions) => {
      const newOptionsData = [...prevOptions];
      newOptionsData[index] = { count: 0, text, id: index };
      return newOptionsData;
    });
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
  function removeHandler() {
    setQuestionAdded(false);
    setQuestion("");
    onRemove();
  }
  // useEffect(() => {
  //   console.log(allData);
  // }, [allData]);
  const createArrayOfSize = (size) => {
    return Array.from({ length: size }, (_, index) => index);
  };
  // console.log(show);
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter the question here"
        placeholderTextColor="gray"
        onChangeText={(text) => setQuestion(text)}
        style={{
          padding: 15,
          backgroundColor: "#DFE4E6",
          width: "80%",
          borderRadius: 10,
          margin: 10,
        }}
        value={question}
      />
      <Picker
        mode="dropdown"
        style={styles.picker}
        selectedValue={questionType}
        onValueChange={(value) => {
          setQuestionType(value);
          // console.log(questionType)

          setShow(value == 0 || value == 3);
        }}
        itemStyle={{ fontSize: 18, color: "black" }}
      >
        <Picker.Item label="Multiple Choice" value={0} />
        <Picker.Item label="Short Answer" value={1} />
        <Picker.Item label="Paragraph" value={2} />
        <Picker.Item label="Checkbox" value={3} />
      </Picker>
      {/* <Text>{questionType == 0 ? "Multiple Choice " : "Other"}</Text> */}
      {show && (
        <>
          <TextInput
            keyboardType="numeric"
            placeholder="Options?"
            defaultValue="2"
            onChangeText={(text) => setNumberOfChoices(parseInt(text))}
            placeholderTextColor="gray"
            style={{
              padding: 10,
              backgroundColor: "#DFE4E6",
              width: "30%",
              textAlign: "center",
              borderRadius: 10,
              margin: 10,
            }}
          />
          {createArrayOfSize(numberOfChoices).map((index) => (
            <TextInput
              key={index}
              placeholderTextColor="black"
              placeholder={`Question ${index + 1}`}
              onChangeText={(text) => optionsCreationHandler(text, index)}
              style={{
                padding: 10,
                backgroundColor: "#DFE4E6",
                width: "60%",
                borderRadius: 10,
                margin: 10,
              }}
            />
          ))}
        </>
      )}
      <Button title="Add" onPress={addHandler} />
      <Button title="Remove" onPress={removeHandler} />

      {questionAdded && <Text>Added</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "85%",
    borderRadius: 30,
    minHeight: 300,
    alignItems: "center",
    backgroundColor: "#859982",
    padding: 20,
    justifyContent: "space-around",
    margin: 20,
  },

  picker: {
    backgroundColor: "#DFE4E6",
    borderRadius: 20,
    width: "60%",
    height: 100,
    justifyContent: "center",
    overflow: "hidden",
    margin: 10,
  },
});
