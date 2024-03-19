import { useNavigate } from "react-router-dom";
import classes from "./Authpage.module.css";

export default function Signup() {
  const navigate = useNavigate();
  const switchToLoginHandler = () => {
    navigate("/");
  };
  const signupHandler = () => {
    // Sign up Logic
    navigate("/forms");
  };
  return (
    <div className={classes.container}>
      <div className={classes["form"]}>
        <header>Signup</header>
        <form action="#">
          <input type="text" placeholder="Enter your username" />
          <input type="text" placeholder="Enter your email" />
          <input type="password" placeholder="Create a password" />
          <input type="password" placeholder="Confirm your password" />
          <input
            onclick={signupHandler}
            type="button"
            className={classes.button}
            value="Signup"
          />
        </form>
        {/* <div className={classes.signup}>
          <span className={classes.signup}>
            Already have an account?
            <label onClick={switchToLoginHandler} for="check">
              Login
            </label>
          </span>
        </div> */}
      </div>
    </div>
  );
}
