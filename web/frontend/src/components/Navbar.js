import { useLocation, useNavigate } from "react-router-dom";
import classes from "./Navbar.module.css";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeName = location.pathname.substring(1);
  let pageName;
  switch (routeName) {
    case "":
      pageName = "Login";
      break;
    case "signup":
      pageName = "Signup";
      break;
    case "forms":
      pageName = "Forms";
      break;
    case "create-forms":
      pageName = "Create Form";
      break;
    default:
      break;
  }

  // Check if current route is home ("/")
  const isHomePage =
    location.pathname === "/" || location.pathname === "/forms";

  console.log(location.pathname);
  if (isHomePage) {
    return null;
  }

  return (
    <div className={classes.nav}>
      <h1>Forms App</h1>
      <h4>{pageName}</h4>
      <button
        onClick={() => {
          navigate(-1);
        }}
      >
        {"<"}
      </button>
    </div>
  );
}
