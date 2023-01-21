import "./App.css";
import NavBar from "./Components/Navbar";
import Body from "./Components/Body";
import { useEffect } from "react";
function App() {
  useEffect(() => {
    console.log("running")
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => console.log(data));
 }, []);
  return (
    <div className="App">
      <NavBar />
      <Body />
    </div>
  );
}

export default App;
