import React, { useEffect, useLayoutEffect, useState } from "react";
import classes from "./FormDetails.module.css";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { CSVLink } from "react-csv";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

export default function FormDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const [responseData, setResponseData] = useState([]);
  const formData = { title: "Form Title", description: "Form Description" };
  const cookies = new Cookies();

  useLayoutEffect(() => {
    async function structureData(formData) {
      const restructuredFormData = Object.values(formData).map(
        ({ question, options, textResponseCount }) => {
          const responses = [];

          // Add options to responses
          options.forEach(({ text, count }) => {
            responses.push({ response: text, count });
          });

          // Add text responses to responses
          Object.entries(textResponseCount).forEach(([response, count]) => {
            responses.push({ response, count });
          });

          return { question, responses };
        }
      );
      return restructuredFormData;
    }

    async function fetchFormResponses() {
      try {
        const response = await fetch(
          `http://localhost:4321/forms/${params.formId}`
        );
        const data = await response.json();
        const structuredData = await structureData(data);
        setResponseData(structuredData);
      } catch (error) {
        console.error("Error fetching form responses:", error);
      }
    }
    fetchFormResponses();
  }, [params.formId]);

  useEffect(() => {
    const userUID = cookies.get("user-uid");
    if (!userUID) {
      navigate("/");
    }
  }, [cookies, navigate]);

  return (
    <div className={classes.page}>
      <div className={classes.form}>
        <h1 className={classes.title}>{formData.title}</h1>
        <div className={classes.description}>
          <p className={classes.text}>{formData.description}</p>
        </div>
        <h2 className={classes.analysisHeader}>Response Analysis</h2>
        {responseData && responseData.length > 0 ? (
          <div className={classes.chartContainer}>
            {responseData.map((item, index) => {
              const labels = item.responses.map((r) => r.response);
              const data = item.responses.map((r) => r.count);
              const backgroundColor = item.responses.map(
                () => "#" + Math.floor(Math.random() * 16777215).toString(16) // Generate a random color
              );
              const pieData = {
                labels,
                datasets: [
                  {
                    data,
                    backgroundColor,
                    borderColor: backgroundColor,
                    borderWidth: 1,
                  },
                ],
              };

              return (
                <div key={index}>
                  <h3>{item.question}</h3>
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      legend: { display: true, position: "bottom" },
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading...</p>
        )}

        {responseData.length > 0 && (
          <CSVLink
            data={responseData.reduce((acc, { question, responses }) => {
              responses.forEach(({ response, count }) => {
                acc.push({ question, [`${response} (Responses)`]: count });
              });
              return acc;
            }, [])}
            filename={"survey_responses.csv"}
          >
            Download CSV
          </CSVLink>
        )}
      </div>
    </div>
  );
}
