// npm run dev
import { createContext, useMemo, useState } from "react";
import Options from "./Components/OptionsComponents/OptionsMain";
import Body from "./Components/Body";

export const configContext = createContext();
function App() {
  const [configObject, setConfigObject] = useState({
    degree: "celsius",
  });
  const configObjectMemo = useMemo(() => {
    return { configObject, setConfigObject };
  }, [configObject]);

  return (
    <div className="App">
      <configContext.Provider value={configObjectMemo}>
        <Options />
        <Body />
      </configContext.Provider>
    </div>
  );
}

export default App;
