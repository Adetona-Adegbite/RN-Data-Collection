import { useNavigate } from "react-router-dom";
import classes from "./Home.module.css";
import { Fragment, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { CopyToClipboard } from "react-copy-to-clipboard";

function FormCard({ title, id, onPress, copyToClipboard }) {
  const [copied, setCopied] = useState(false);
  const handleButtonClick = (event) => {
    event.stopPropagation(); // Prevent click event from bubbling up to the parent div
    copyToClipboard(); // Call the copyToClipboard function
  };
  function copyHandler() {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }
  return (
    <div className={classes.cardContainer} onClick={onPress}>
      <div className={classes.textContainer}>
        <h2 className={classes.nameText}>{title}</h2>
        <p className={classes.dataText}>{id}</p>
      </div>
      <CopyToClipboard onCopy={copyHandler} text={id}>
        <button
          onClick={handleButtonClick}
          className={classes.showDetailsButton}
        >
          {copied ? "Copied" : "Copy to Clipboard"}
        </button>
      </CopyToClipboard>
    </div>
  );
}

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [modal, setShowModal] = useState(false);
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();
  const cookies = new Cookies();
  useEffect(() => {
    async function fetchUserData() {
      const userUID = cookies.get("user-uid");
      const requestData = {
        userUID: userUID, // Assuming userUid is the user's UID you want to send
      };
      const response = await fetch("http://localhost:4321/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      // console.log(response);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      console.log(data);
      setUsername(data.username);
      setForms(data.forms);
    }
    fetchUserData();
  }, []);
  useEffect(() => {
    const userUID = cookies.get("user-uid");
    if (!userUID) {
      navigate("/");
    }
  }, [cookies, navigate]);
  const formAddHandler = () => {
    // Add form logic
    navigate("/create-forms");
  };
  function copyToClipboardHandler() {
    // console.log("hello");
  }

  async function formDetailsHandler(item) {
    navigate(`/forms/${item.formID}`);
  }
  function toggleModal() {
    setShowModal(!modal);
  }
  const logoutHandler = () => {
    setShowModal(false);
    cookies.remove("user-uid");
  };
  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <div className={classes.userInfo}>
          <h1>Welcome {username}</h1>
          <p>Create and Manage Forms</p>
        </div>
        <div onClick={toggleModal} className={classes.dp}>
          <p>{username[0]}</p>
        </div>
      </div>
      <div className={classes.middle}>
        <p>Your Forms</p>
        <button onClick={formAddHandler}>+</button>
      </div>
      <hr className={classes.hr} />
      {modal && (
        <>
          <div onClick={toggleModal} className={classes.modal}></div>
          <div className={classes["modal-card"]}>
            <button onClick={logoutHandler}>Log Out</button>
          </div>
        </>
      )}
      <div className={classes.forms}>
        {forms.map((item) => {
          return (
            <FormCard
              key={item.id}
              title={item.title}
              id={item.formID}
              copyToClipboard={copyToClipboardHandler}
              onPress={formDetailsHandler.bind(this, item)}
            />
          );
        })}
      </div>
    </div>
  );
}
