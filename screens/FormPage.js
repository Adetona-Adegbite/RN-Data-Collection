import { useEffect } from "react";

export default function FormPage({ route }) {
  useEffect(() => {
    const { params } = route;
    console.log(params);
    const formData = params?.formData;
    console.log(formData);
  }, []);
  return;
}
