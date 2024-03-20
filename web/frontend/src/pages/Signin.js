import { useNavigate } from "react-router-dom";
import classes from "./Authpage.module.css";
import { useState } from "react";
import Cookies from "universal-cookie";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cookies = new Cookies();

  const navigate = useNavigate();

  const switchToLoginHandler = () => {
    navigate("/");
  };

  async function registerHandler(e) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const requestBody = {
      email: email,
      password: password,
      username: username,
    };
    try {
      const response = await fetch("http://localhost:4321/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      console.log(response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      cookies.set("user-uid", data, { path: "/" });
      // Registration successful
      setError("");
      setLoading(false);
      navigate("/forms");
    } catch (error) {
      console.log("Error:", error.message);
      setError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes["form"]}>
        <header>Signup</header>
        <form onSubmit={registerHandler}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <input
            type="submit"
            className={classes.button}
            value={loading ? "Signing up..." : "Signup"}
            disabled={loading}
          />
        </form>
        {error && (
          <div style={{ textAlign: "center", color: "red" }}>{error}</div>
        )}
        <div className={classes.signup}>
          <span className={classes.signup}>
            Already have an account?
            <label onClick={switchToLoginHandler} htmlFor="check">
              Login
            </label>
          </span>
        </div>
      </div>
    </div>
  );
}
