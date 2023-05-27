// npm run dev
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Options from "./Components/OptionsComponents/OptionsMain";
import Body from "./Components/Body";
import { updateWeather, updateStoredFavLocations } from "./Utilities.mjs";

export const configContext = createContext();
export const favoriteLocationsContext = createContext();
export const weatherData = createContext();

const MemoizedBody = React.memo(Body);
const MemoizedOptions = React.memo(Options);

function App() {
  console.log("app render");
  function useMemoizeUseState(value, setValueFunction) {
    return useMemo(() => {
      return [value, setValueFunction];
    }, [value, setValueFunction]);
  }
  const [configObject, setConfigObject] = useState(
    JSON.parse(localStorage.getItem("configObject")) || {
      degree: "celsius",
    }
  );
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  useEffect(() => {
    const storedFavLocations = JSON.parse(
      localStorage.getItem("favoriteLocations")
    );
    if (storedFavLocations && storedFavLocations?.length > 0)
      updateStoredFavLocations(storedFavLocations, configObject).then(
        (fetchedFavLocations) => setFavoriteLocations(fetchedFavLocations)
      );
  }, []);

  useEffect(() => {
    if (!firstRender.current) {
      console.log("fav Locations changed");
      localStorage.setItem(
        "favoriteLocations",
        JSON.stringify(favoriteLocations)
      );
    }
  }, [favoriteLocations]);
  const currentWeatherData = useRef(null); //holds the current weather data if is needed do add to favorites
  const [clickedFavoriteLocationData, setClickedFavoriteLocationData] =
    useState(null);
  const firstRender = useRef(true);
  const prevConfigObject = useRef(configObject);
  function handleClickFavoriteLocationData(clickedFavLocationDataParam) {
    console.log(
      currentWeatherData.current,
      clickedFavLocationDataParam,
      clickedFavoriteLocationData
    );

    if (currentWeatherData.current !== clickedFavLocationDataParam) {
      //check if clickedFavLocationData is different from current weather data
      console.log("new favLocation", clickedFavLocationDataParam);
      setClickedFavoriteLocationData(clickedFavLocationDataParam);
    }
  }

  const setCurrentWeatherData = useCallback((weatherData) => {
    //temporary
    console.log("w", weatherData);
    currentWeatherData.current = weatherData;
    setClickedFavoriteLocationData(null); //clear the clickedFavoriteLocationData because its not needed anymore
  }, []);

  const handleAddFavoriteWeatherData = useCallback(() => {
    if (!currentWeatherData.current) return;
    const findDublicateFavLocation = favoriteLocations.findIndex(
      //chech if currentLocation already exists in favLocations
      (favoriteLocation) =>
        favoriteLocation.coords.lon.toFixed(2) ===
          currentWeatherData.current.coords.lon.toFixed(2) &&
        favoriteLocation.locationName ===
          currentWeatherData.current.locationName
    );

    if (findDublicateFavLocation === -1 || favoriteLocations.length === 0) {
      //if value is -1 there are no duplicates
      setFavoriteLocations((prevState) => [
        ...prevState,
        currentWeatherData.current,
      ]);
      console.log("no duplicates");
      return "no duplicates";
    }
    console.log("duplicates!!!");
    return "duplicate found";
  }, [favoriteLocations]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    let propertyNameChanged;
    localStorage.setItem("configObject", JSON.stringify(configObject));
    for (const propName in configObject) {
      if (configObject[propName] !== prevConfigObject[propName])
        propertyNameChanged = propName;
    }
    console.log(propertyNameChanged);
    const updatedFavoriteLocations = favoriteLocations.map(
      (favoriteLocationData) =>
        updateWeather(favoriteLocationData, configObject)
    );

    setFavoriteLocations(updatedFavoriteLocations);
  }, [configObject]);
  // const favoriteLocationsContextProviderValue = useMemo(() => {
  //   return {
  //     favLocationsUseState: [favoriteLocations, setFavoriteLocations],
  //     onFavLocationClickAddToFavWeather: handleAddFavoriteWeatherData,
  //     onFavLocationClickAddFavLocationData: handleClickFavoriteLocationData,
  //   };
  // }, [
  //   favoriteLocations,
  //   setFavoriteLocations,
  //   handleAddFavoriteWeatherData,
  //   handleClickFavoriteLocationData,
  // ]);
  return (
    <div className="App">
      <configContext.Provider
        value={useMemoizeUseState(configObject, setConfigObject)}
      >
        <favoriteLocationsContext.Provider
          value={{
            favLocationsUseState: useMemoizeUseState(
              favoriteLocations,
              setFavoriteLocations
            ),
            onFavLocationClickAddToFavWeather: handleAddFavoriteWeatherData,
            onFavLocationClickAddFavLocationData:
              handleClickFavoriteLocationData,
          }}
        >
          {/* {currentWeatherData.current === null ? (
            <div  style={{ background: "red" }}>hello</div>
          ) : null} */}{" "}
          <MemoizedOptions />
          <MemoizedBody
            addCurrentWeather={setCurrentWeatherData}
            favLocationData={clickedFavoriteLocationData}
            // addWeatherFromFavLocation={setFavLocationOnBody}
          />
        </favoriteLocationsContext.Provider>
      </configContext.Provider>
    </div>
  );
}

export default App;
