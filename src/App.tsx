import { useEffect } from "react";
import "./App.scss";
import Experience from "./experience/Experience";

export default function App() {
  useEffect(() => {
    console.log("APP MOUNTED");
  }, []);

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh",
      margin: 0,
      padding: 0,
      overflow: "hidden"
    }}>
      <Experience />
    </div>
  );
}
