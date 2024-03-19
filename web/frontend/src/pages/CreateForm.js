import React, { useEffect, useState } from "react";
import classes from "./CreateForm.module.css";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { v1 as uuid } from "uuid";

function QuestionCard({ id, onAdd }) {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("5"); // Set initial state to '5'
  const [optionsData, setOptionsData] = useState(Array(2).fill("")); // Initialize with 2 empty strings
  const [added, setAdded] = useState(false);
  const handleOptionChange = (e, index) => {
    const newOptionsData = [...optionsData];
    newOptionsData[index] = { count: 0, text: e.target.value, id: index };
    setOptionsData(newOptionsData);
  };

  const handleAddOption = () => {
    if (optionsData[optionsData.length - 1] !== "") {
      setOptionsData((oldOptions) => [...oldOptions, ""]);
    }
  };

  const handleAddQuestion = () => {
    if (question !== "") {
      setAdded(true);
      onAdd({
        question: question,
        questionType: questionType,
        optionsData: optionsData,
      });
    }
  };

  const handleQuestionTypeChange = (e) => {
    const newQuestionType = e.target.value;
    setQuestionType(newQuestionType);

    if (newQuestionType === "1") {
      setOptionsData(["", ""]);
    }
  };

  return (
    <div className={classes["question-card"]}>
      <input
        placeholder="Enter the question"
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <select value={questionType} onChange={handleQuestionTypeChange}>
        <option value={5}>Select a question type</option>
        <option value={0}>Multiple Choice</option>
        <option value={1}>Short Answer</option>
        <option value={2}>Paragraph</option>
        <option value={3}>Checkbox</option>
      </select>
      <div className={classes.options}>
        {(questionType === "0" || questionType === "3") &&
          optionsData.map((option, index) => (
            <input
              className={classes["option-input"]}
              key={index}
              value={option.text}
              placeholder="Enter an Option"
              onChange={(e) => handleOptionChange(e, index)}
            />
          ))}
      </div>
      {(questionType === "0" || questionType === "3") && (
        <button onClick={handleAddOption}>Add Option</button>
      )}
      <button onClick={handleAddQuestion}>Add Question</button>
      {added && <p>Added</p>}
    </div>
  );
}
function FormCreationPage() {
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [questionsData, setQuestionData] = useState([]);
  const cookies = new Cookies();

  useEffect(() => {
    const userUID = cookies.get("user-uid");
    if (!userUID) {
      navigate("/");
    }
  }, [cookies, navigate]);

  const handleAddQuestionData = (newQuestion) => {
    const questionExists = questionsData.some(
      (question) => question.question === newQuestion.question
    );

    if (!questionExists && newQuestion !== "") {
      setQuestionData((oldQuestions) => [...oldQuestions, newQuestion]);
    }
  };

  const handleNewQuestion = () => {
    setQuestions((oldQuestions) => [...oldQuestions, {}]);
  };

  const handleSubmitForm = async () => {
    const filteredQuestionsData = questionsData.map((question) => ({
      ...question,
      optionsData: question.optionsData.filter(
        (option) => option.text.trim() !== ""
      ),
    }));
    const randomUUID = uuid();
    const fiveDigitCode = randomUUID.substr(0, 5);
    const userUID = cookies.get("user-uid");
    const formDoc = {
      id: userUID + fiveDigitCode,
      creatorId: userUID,
      title: formTitle,
      description: formDescription,
      questions: filteredQuestionsData,
    };
    console.log(formDoc);
    const response = await fetch("http://localhost:4321/add-forms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formDoc),
    });
    console.log(response);
    if (!response.ok) {
      alert(
        "There was an error in submitting the form.\n Check form data and internet and try again"
      );
    } else {
      navigate("/forms");
    }
  };

  return (
    <div className={classes.page}>
      <input
        type="text"
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        placeholder="Description"
        type="text"
        value={formDescription}
        onChange={(e) => setFormDescription(e.target.value)}
      />
      <button
        className={classes["new-question-button"]}
        onClick={handleNewQuestion}
      >
        +
      </button>
      {questions.map((_, index) => (
        <QuestionCard key={index} id={index} onAdd={handleAddQuestionData} />
      ))}
      <button className={classes.submit} onClick={handleSubmitForm}>
        Submit Form
      </button>
    </div>
  );
}

export default FormCreationPage;
