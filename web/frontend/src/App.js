import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import Base from "./Base";
import LoginPage from "./pages/Login";
import FormCreationPage from "./pages/CreateForm";
import FormPage from "./pages/FormDetailsPage";
import Signup from "./pages/Signin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Base />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/forms",
        element: <HomePage />,
      },
      {
        path: "/forms/:formId",
        element: <FormPage />,
      },
      {
        path: "/create-forms",
        element: <FormCreationPage />,
      },
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
