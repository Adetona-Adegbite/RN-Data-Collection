import { useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  Dimensions,
  LogBox,
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
import { LineChart, PieChart } from "react-native-chart-kit";
import { jsonToCSV } from "react-native-csv";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function FormDetails({ route }) {
  const [formData, setFormData] = useState({});
  const [formResponses, setFormResponses] = useState([]);
  const [questionAnalysis, setQuestionAnalysis] = useState({});
  const [formattedResponse, setFormattedResponse] = useState([]);
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const { params } = route;
    const itemData = params?.item;

    const fetchFormId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const formID = params?.item.formID;
      } catch (error) {
        console.error("Error fetching form ID:", error);
      }
    };

    fetchFormId();
  }, [route]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const formID = await AsyncStorage.getItem("formId");
        console.log(formID);

        const { uid } = JSON.parse(userData);

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
          const allFormData = {
            title: fetchedFormData.title,
            description: fetchedFormData.description,
            questions: fetchedFormData.questions,
          };
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

  useLayoutEffect(() => {
    async function fetchFormSubmissions() {
      const formID = await AsyncStorage.getItem("formId");

      console.log("formId", formID);
      const q = collection(
        FIREBASE_DB,
        "form-submissions",
        formID,
        "user-responses"
      );
      try {
        const querySnapshot = await getDocs(q);
        const submissions = [];

        querySnapshot.forEach((doc) => {
          const submissionData = doc.data();
          submissions.push(submissionData.questions);
        });

        const formattedResponses = [];

        submissions.forEach((questions) => {
          questions.forEach((question) => {
            formattedResponses.push({
              questionNumber: question.questionId,
              question: question.question,
              options: question.options || [],
              response: question.response,
            });
          });
        });

        // console.log(formattedResponses[0]);
        // console.log(formattedResponses[1]);

        setFormattedResponse(formattedResponses);
        const structuredResponses = structureResponses(formattedResponses);

        const finalStructure = [];

        structuredResponses.forEach((res) => {
          const { id, question, options, response } = res;

          const existingEntryIndex = finalStructure.findIndex(
            (entry) => entry.id === id
          );

          if (existingEntryIndex !== -1) {
            options.forEach((option) => {
              const existingOption = finalStructure[
                existingEntryIndex
              ].options.find((opt) => opt.option === option.option);
              if (existingOption) {
                existingOption.count += option.count;
              } else {
                finalStructure[existingEntryIndex].options.push({
                  option: option.option,
                  count: option.count,
                });
              }
            });

            if (response !== null) {
              const existingResponse = finalStructure[
                existingEntryIndex
              ].responses.find((resp) => resp[response]);
              if (existingResponse) {
                existingResponse[response]++;
              } else {
                finalStructure[existingEntryIndex].responses.push({
                  [response]: 1,
                });
              }
            }
          } else {
            const newEntry = { id, question, options: [], responses: [] };
            options.forEach((option) => {
              newEntry.options.push({
                option: option.option,
                count: option.count,
              });
            });
            if (response !== null) {
              newEntry.responses.push({ [response]: 1 });
            }
            finalStructure.push(newEntry);
          }
        });
        // console.log(finalStructure);
        const analysis = {};
        finalStructure.forEach((entry) => {
          if (entry.options.length > 0) {
            // MCQ
            const totalResponses = entry.options.reduce(
              (total, option) => total + option.count,
              0
            );
            const optionsPercentage = entry.options.map((option) => ({
              option: option.option,
              percentage: `${((option.count / totalResponses) * 100).toFixed(
                2
              )}%`,
            }));
            analysis[entry.question] = optionsPercentage;
          } else {
            // Direct Text Answer
            const totalResponses = entry.responses.length;
            // console.log("resposnes", entry);
            const uniqueResponses = Array.from(new Set(entry.responses)); // Get unique responses
            // console.log("unique resposnes", uniqueResponses);
            const transformedDataset = uniqueResponses.map((obj) => {
              const newObj = {};
              Object.keys(obj).forEach((key) => {
                newObj["option"] = key;
              });
              return newObj;
            });
            // console.log("improved dataset", transformedDataset);
            const optionsPercentage = transformedDataset.map((response) => ({
              option: response.option,
              percentage: "50%",
            }));
            // console.log(optionsPercentage);
            analysis[entry.question] =
              optionsPercentage.length === 1
                ? optionsPercentage[0].option
                : optionsPercentage;
          }
        });
        let chartFormat = []; // Use an array to store data for multiple questions
        // console.log(analysis);
        for (key in analysis) {
          let questionData = {
            key: key,
            options: [], // Array to store options for each question
          };
          // console.log(key);
          // console.log(analysis[key]);
          if (Array.isArray(analysis[key])) {
            for (option in analysis[key]) {
              // console.log(analysis);
              let optionData = {
                option: analysis[key][option].option,
                percentage: parseInt(analysis[key][option].percentage),
              };
              // console.log(optionData);
              questionData.options.push(optionData); // Add option data to the options array
            }
          } else {
            // console.log(formResponses);
            let optionData = {
              option: analysis[key], // Assuming 'Ggg' is the option
              percentage: `${
                formResponses > 0 &&
                ((1 / formResponses.length) * 100).toFixed(2)
              }`, // Set a default percentage value
            };
            // console.log(optionData);
            questionData.options.push(optionData); // Add op
          }
          chartFormat.push(questionData); // Add question data to the chartFormat array
        }
        // console.log(chartFormat);

        const pieChartData = chartFormat.map((questionData, index) => {
          return questionData.options.map((optionData) => ({
            title: questionData.key,
            name: optionData.option, // Use option name as the name
            population: optionData.percentage, // Convert percentage to float
            color: getRandomColor(), // Generate a random color for each slice (you can replace this with your own color logic)
            legendFontColor: "rgba(0,0,0,0.6)",
            legendFontSize: 15,
          }));
        });
        // console.log(pieChartData);
        function getRandomColor() {
          // Function to generate a random color
          return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
          )}, ${Math.floor(Math.random() * 256)})`;
        }

        setChartData(pieChartData);

        setQuestionAnalysis(analysis);
        setFormResponses(structuredResponses);
      } catch (error) {
        console.error("Error fetching form submissions:", error);
      }
    }

    fetchFormSubmissions();
  }, []);
  function downloadAnalysisCSV() {
    const csvFields = ["Question", "Response"]; // Define CSV fields
    console.log(formattedResponse);
    const csvData = formattedResponse.map((response) => {
      const question = response.question;
      let responseText;

      if (typeof response.response === "string") {
        responseText = response.response;
      } else {
        const trueKeys = Object.keys(response.response).filter(
          (key) => response.response[key]
        );
        responseText = trueKeys
          .map((key) => response.options[key].text)
          .join(", ");
      }

      return [question, responseText];
    });

    const csv = jsonToCSV({ fields: csvFields, data: csvData });

    console.log(csv);

    const directoryUri = FileSystem.documentDirectory;
    const fileUri = directoryUri + `formResponses.csv`;

    FileSystem.writeAsStringAsync(fileUri, csv, { encoding: "utf8" })
      .then(() => {
        console.log(`wrote file ${fileUri}`);
      })
      .catch((error) => console.error(error));

    Sharing.shareAsync(fileUri)
      .then(() => {
        console.log(`shared file ${fileUri}`);
      })
      .catch((error) => console.error(error));
  }
  function structureResponses(formattedResponses) {
    const structuredResponses = [];
    formattedResponses.forEach((question) => {
      const responseCounts = {};
      const questionOptions = [];

      if (Array.isArray(question.options)) {
        question.options.forEach((option) => {
          responseCounts[option.text] = 0;
          questionOptions.push(option.text);
        });
      }

      if (!Array.isArray(question.options) && question.response) {
        const response = question.response;
        if (responseCounts[response] !== undefined) {
          responseCounts[response] += 1;
        } else {
          responseCounts[response] = 1;
        }
        questionOptions.push(response);
      }

      if (question.response instanceof Object) {
        Object.keys(question.response).forEach((optionId) => {
          const selectedOption = question.options.find(
            (option) => option.id.toString() === optionId
          );
          if (selectedOption && question.response[optionId]) {
            responseCounts[selectedOption.text] += 1;
          }
        });
      }

      structuredResponses.push({
        id: question.questionNumber,
        question: question.question,
        options: questionOptions.map((option) => ({
          option: option,
          count: responseCounts[option] || 0,
        })),
        response: questionOptions.length < 1 ? question.response : null,
      });
    });

    return structuredResponses;
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
              <View key={index}>
                <Text style={styles.text}>{option.text}</Text>
                <Checkbox />
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
          <Text style={styles.analysisHeader}>Response Analysis</Text>
          {/* {Object.keys(questionAnalysis).map((question, index) => (
            <View key={index} style={styles.analysisItem}>
              <Text style={styles.analysisQuestion}>{question}</Text>
              <View style={styles.analysisOptions}>
                {questionAnalysis[question].map((option, idx) => (
                  <Text key={idx}>
                    {option.option}: {option.percentage}%
                  </Text>
                ))}
              </View> */}
          {/* </View>
          ))} */}
          <View>
            {chartData.map((questionData, index) => (
              <View key={index}>
                <Text style={{ textAlign: "center", fontSize: 24 }}>
                  {questionData[index].title}
                </Text>
                <PieChart
                  data={questionData}
                  // label={(datum) => `${datum.name}: ${datum.population}%`} // add percentage to label
                  width={350}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#fb8c00",
                    backgroundGradientTo: "#ffa726",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: () => `#000000`,
                    labelColor: () => `#000000`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726",
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  absolute
                />
              </View>
            ))}
          </View>
          <Button onPress={downloadAnalysisCSV} title="Download csv " />
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
  question: {
    width: "75%",
    padding: 20,
    marginBottom: 20,
  },
  description: {
    width: "60%",
    height: "auto",
  },
  text: {
    color: "white",
  },
  form: {
    backgroundColor: "#859982",
    borderRadius: 10,
    width: "90%",
    minHeight: 600,
  },
  formContainer: {
    alignItems: "center",
  },
  analysisHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 50,
  },
  analysisItem: {
    backgroundColor: "#DFE4E6",
    padding: 10,
    borderRadius: 5,
    width: "60%",
    marginBottom: 10,
  },
  analysisQuestion: {
    color: "black",
    fontSize: 20,
    marginBottom: 5,
  },
  analysisOptions: {
    flexDirection: "column",
    flexWrap: "wrap",
    gap: 15,
    marginTop: 10,
  },
});
