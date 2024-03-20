const express = require("express");
const firebase = require("firebase/app");
const admin = require("firebase-admin");
const serviceAccount = require("./confidential/serviceAccountKey.json");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth");
const {
  doc,
  collection,
  getDocs,
  setDoc,
  getFirestore,
  getDoc,
} = require("firebase/firestore");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const firebaseConfig = {
  apiKey: "AIzaSyB3HAVSfiQJupJRFrddIig37teING57iTw",
  authDomain: "rn-data-collection.firebaseapp.com",
  projectId: "rn-data-collection",
  storageBucket: "rn-data-collection.appspot.com",
  messagingSenderId: "724654499739",
  appId: "1:724654499739:web:b9a36f49cb9a5bf593a33e",
};

const FIREBASE_APP = firebase.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rn-data-collection.firebaseio.com",
});

const FIREBASE_DB = getFirestore(FIREBASE_APP);
const auth = getAuth(FIREBASE_APP);

let userUid;

app.post("/user", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  async function authUser() {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      return true;
    } catch (e) {
      return e;
    }
  }

  const response = await authUser();
  console.log(response);
  try {
    if (response.code) {
      console.log("User Not Logged in");
      res.status(401).json({ error: response.code });
    } else {
      console.log("User Logged In");
      const userRecord = await admin.auth().getUserByEmail(email);
      res.json(userRecord);
    }
  } catch (e) {
    console.error(e);
  }
  // try {

  //   // console.log(response.code);
  //   if (response.ok) {
  //
  //     res.json(userRecord);
  //   } else {
  //     if (
  //       response.code === "auth/user-not-found" ||
  //       response.code === "auth/wrong-password" ||
  //       response.code === "auth/invalid-credential"
  //     ) {
  //       res.status(401).json({ error: error.message });
  //     } else {
  //       res.status(500).json({ error: "Internal server error" });
  //     }
  //   }
  // } catch (error) {
  //   console.log("Error:::", error.code);
  //   if (
  //     error.code === "auth/user-not-found" ||
  //     error.code === "auth/wrong-password" ||
  //     error.code === "auth/invalid-credential" ||
  //     error.code === "auth/too-many-requests"
  //   ) {
  //     res
  //       .status(401)
  //       .json({ error: "Invalid email or password. Please try again." });
  //   } else {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // }

  //   const auth = firebase.auth();

  //   // Check if a user is signed in
  //   const user = auth.currentUser;
  //   if (user) {
  //     res.send(`User ID: ${user.uid}`);
  //   } else {
  //     res.send("No user signed in");
  //   }
});

app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  async function registerUser() {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return response;
    } catch (e) {
      return e;
    }
  }

  const response = await registerUser();
  console.log(response);

  try {
    if (response.code) {
      if (response.code === "auth/email-already-in-use") {
        console.log("Email already in use");
        res.status(400).json({ error: "Email already in use" });
      } else {
        console.log("Registration failed:", response.message);
        res.status(400).json({ error: response.message });
      }
    } else {
      console.log("User Registered Successfully", response.user.uid);
      const userDocRef = doc(
        FIREBASE_DB,
        "users",
        response.user.uid.substring(0, 4)
      );
      await setDoc(userDocRef, {
        email: response.user.email,
        username: username,
      });
      res.json(response.user.uid);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Forms
app.post("/forms", async (req, res) => {
  const { userUID } = req.body;
  // console.log(userUID);

  try {
    const userDocRef = doc(FIREBASE_DB, "users", userUID.substring(0, 4));

    const userDocSnapshot = await getDoc(userDocRef);
    // console.log(userDocSnapshot.data());
    if (userDocSnapshot.exists()) {
      const formsCollectionRef = collection(userDocRef, "forms");
      const formsSnapshot = await getDocs(formsCollectionRef);

      const fetchedForms = [];
      formsSnapshot.forEach((doc) => {
        fetchedForms.push({
          formID: doc.id,
          title: doc.data().title,
          // Other form data you want to retrieve
        });
      });
      res.json({
        forms: fetchedForms,
        username: userDocSnapshot.data().username,
      });
    } else {
      res.status(404).json({ error: "User Not Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

app.post("/add-forms", async (req, res) => {
  // const { formData } = req.body;
  const formData = req.body;
  const randomUUID = uuid.v1();

  try {
    const fiveDigitCode = randomUUID.substr(0, 5);
    const formRef = doc(
      FIREBASE_DB,
      "users",
      formData.creatorId.substr(0, 4),
      "forms",
      formData.creatorId.substr(0, 4) + fiveDigitCode
    );
    const formDoc = {
      id: userUid + fiveDigitCode,
      creatorId: formData.creatorId.substr(0, 4),
      title: formData.title,
      description: formData.description,
      questions: formData.questions,
    };
    await setDoc(formRef, JSON.parse(JSON.stringify(formDoc)));
    res.json({ success: true, message: "Request successful!" });
  } catch (e) {
    console.error("Error adding form:", e);
    res.status(500).json({ success: false, error: "Failed to add form." });
  }
});

app.get("/forms/:formId", async (req, res) => {
  const formId = req.params.formId;
  try {
    const q = collection(
      FIREBASE_DB,
      "form-submissions",
      formId,
      "user-responses"
    );
    const querySnapshot = await getDocs(q);
    const submissions = [];
    querySnapshot.forEach((doc) => {
      const submissionData = doc.data();
      submissions.push(submissionData.questions);
    });
    function structureData(data) {
      const structuredData = {};

      data.forEach((responseSet) => {
        responseSet.forEach((response) => {
          const questionId = response.questionId;

          // Initialize question data if not present
          if (!structuredData[questionId]) {
            structuredData[questionId] = {
              question: response.question,
              options: response.options
                ? response.options.map((option) => ({
                    ...option,
                    count: 0,
                  }))
                : [],
              textResponseCount: {},
            };
          }

          // Check if the response is an object (multiple choice) or text (open-ended)
          if (typeof response.response === "object") {
            const selectedOptionId = Object.keys(response.response)[0];
            // Increment the count for the selected option
            const optionIndex = structuredData[questionId].options.findIndex(
              (option) => option.id.toString() === selectedOptionId
            );
            if (optionIndex !== -1) {
              structuredData[questionId].options[optionIndex].count++;
            }
          } else if (typeof response.response === "string") {
            // Record the text response count
            const textResponse = response.response.trim();
            structuredData[questionId].textResponseCount[textResponse] =
              (structuredData[questionId].textResponseCount[textResponse] ||
                0) + 1;
          }
        });
      });

      // Convert textResponse arrays to textResponseCount objects
      Object.values(structuredData).forEach((question) => {
        if (question.textResponse && question.textResponse.length) {
          question.textResponse.forEach((response) => {
            const textResponse = response.trim();
            question.textResponseCount[textResponse] =
              (question.textResponseCount[textResponse] || 0) + 1;
          });
          delete question.textResponse; // Remove the original textResponse array
        }
      });

      return structuredData;
    }

    // Call the function and log the result
    const structuredResponse = structureData(submissions);
    console.log(submissions);
    res.json(structuredResponse);
  } catch (error) {
    console.log("Error fetching form data:", error);
    res.status(500).json({ error: error });
  }
});

const PORT = process.env.PORT || 4321;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
