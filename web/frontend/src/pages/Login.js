import { useNavigate } from "react-router-dom";
import classes from "./Authpage.module.css";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

export default function Login() {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const uid = cookies.get("user-uid");
    if (uid) {
      // Redirect to another route if the cookie exists
      navigate("/forms");
    }
  }, [cookies, navigate]);
  const switchToSignupHandler = () => {
    navigate("/signup");
  };

  async function loginHandler(e) {
    e.preventDefault();
    setLoading(true);
    const requestBody = {
      email: email,
      password: password,
    };
    try {
      const response = await fetch("http://localhost:4321/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      console.log(response);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      // Handle successful response
      // console.log(data.uid);
      cookies.set("user-uid", data.uid, { path: "/" });
      setError("");
      navigate("/forms");
    } catch (error) {
      // Handle error
      console.log("Error:", error.message);
      if (
        error.message === "auth/user-not-found" ||
        error.message === "auth/wrong-password" ||
        error.message == "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
      setLoading(false);
    }
  }
  return (
    <div className={classes.container}>
      <div className={classes["form"]}>
        <header>Login</header>
        <form action="#">
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            name="email"
            placeholder="Enter your email"
          />
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            name="password"
            type="password"
            placeholder="Enter your password"
          />
          <button
            onClick={loginHandler}
            type="button"
            className={classes.button}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            marginTop: "5px",
            marginBottom: "10px",
            color: "red",
          }}
        >
          {error}
        </p>
        <div className={classes.signup}>
          <span className={classes.signup}>
            Don't have an account?
            <label onClick={switchToSignupHandler} for="check">
              Signup
            </label>
          </span>
        </div>
      </div>
    </div>
  );
}
