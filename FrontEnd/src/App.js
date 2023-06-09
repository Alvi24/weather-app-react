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
  function useMemoizeUseState(value, setValueFunction) {
    return useMemo(() => {
      return [value, setValueFunction];
    }, [value, setValueFunction]);
  }
  const [configObject, setConfigObject] = useState(
    JSON.parse(localStorage.getItem("configObject")) || {
      degree: "celsius",
      timeFormat: "en-GB",
    }
  );

  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const currentWeatherData = useRef(null);
  const [clickedFavoriteLocationData, setClickedFavoriteLocationData] =
    useState(null);
  const [updatedCurrentWeather, setUpdatedCurrentWeather] = useState();
  const firstRender = useRef(true);
  const prevConfigObject = useRef(configObject);
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
      localStorage.setItem(
        "favoriteLocations",
        JSON.stringify(favoriteLocations)
      );
    }
  }, [favoriteLocations]);
  function handleClickFavoriteLocationData(clickedFavLocationDataParam) {
  

    if (
      currentWeatherData.current !== clickedFavLocationDataParam &&
      clickedFavLocationDataParam.coords.lat !==
        currentWeatherData.current.coords.lat
    ) {
      setClickedFavoriteLocationData(clickedFavLocationDataParam);
    }
  }

  const setCurrentWeatherData = useCallback((weatherData) => {
    currentWeatherData.current = weatherData;
    setClickedFavoriteLocationData(null);
  }, []);

  const handleAddFavoriteWeatherData = useCallback(() => {
    if (!currentWeatherData.current) return;
    let isCurrentLocationInFavLocations = false;
    favoriteLocations.forEach((favoriteLocation) => {
      if (
        favoriteLocation.locationName ===
          currentWeatherData.current.locationName &&
        favoriteLocation.coords.lon.toFixed(2) ===
          currentWeatherData.current.coords.lon.toFixed(2)
      )
        isCurrentLocationInFavLocations = true;
    });

    if (!isCurrentLocationInFavLocations || favoriteLocations.length === 0) {
      //if value is -1 there are no duplicates
      setFavoriteLocations((prevState) => [
        ...prevState,
        currentWeatherData.current,
      ]);
      return "no duplicates";
    }
    return "duplicate found";
  }, [favoriteLocations]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    let propertyChangedName;
    localStorage.setItem("configObject", JSON.stringify(configObject));
    for (const propName in configObject) {
      if (configObject[propName] !== prevConfigObject.current[propName])
        propertyChangedName = propName;
    }
    prevConfigObject.current = { ...configObject };
    const updatedFavoriteLocations = favoriteLocations.map(
      (favoriteLocationData) =>
        updateWeather(favoriteLocationData, configObject, propertyChangedName)
    );
    setUpdatedCurrentWeather(
      updateWeather(
        currentWeatherData.current,
        configObject,
        propertyChangedName
      )
    );
    setFavoriteLocations(updatedFavoriteLocations);
  }, [configObject]);

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
          <MemoizedOptions />
          <MemoizedBody
            addCurrentWeather={setCurrentWeatherData}
            favLocationData={clickedFavoriteLocationData}
            updatedCurrentWeather={updatedCurrentWeather}
          />
        </favoriteLocationsContext.Provider>
      </configContext.Provider>
    </div>
  );
}

export default App;
