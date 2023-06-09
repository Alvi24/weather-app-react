import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import SearchBar from "./SearchBar.jsx";
import CurrentWeather from "./WeatherComponents/CurrentWeather.jsx";
import DailyWeather from "./WeatherComponents/DailyWeather.jsx";
import HourlyWeather from "./WeatherComponents/HourlyWeather.jsx";
import { fetchWeatherData, isUserOnMobile } from "../Utilities.mjs";
import styles from "../styles/App.module.css";
import { configContext } from "../App.js";

export const MobileViewContext = createContext();
const MemoizedSearchBar = React.memo(SearchBar);
const MemoizedCurrentWeather = React.memo(CurrentWeather);
const MemoizedDailyWeather = React.memo(DailyWeather);
const MemoizedHourlyWeather = React.memo(HourlyWeather);

export default function Body({
  addCurrentWeather,
  favLocationData,
  updatedCurrentWeather,
}) {
  console.log("body");

  const [configObject] = useContext(configContext);

  const [location, setLocationName] = useState();
  const [weatherData, setWeatherData] = useState();
  const { currentWeather, dailyWeather, hourlyWeather } = weatherData || {};
  const [hourlyWeatherProp, setHourlyWeatherProp] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const [mobileView, setMobileView] = useState(
    matchMedia("(max-width: 520px)").matches
  );

  useEffect(() => {
    const mediaQuery = matchMedia("(max-width: 520px)");

    function handleResize() {
      const onMobileView = mediaQuery.matches;
      console.log(onMobileView);
      setMobileView(onMobileView);
      if (!onMobileView) setIsVisible(false);
    }
    mediaQuery.addEventListener("change", handleResize);
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, [mobileView]);

  const setFetchedWeatherData = useCallback(
    (data) => {
      console.log(data);
      setWeatherData(data);
      setHourlyWeatherProp(data?.hourlyWeather[0]);
      setLocationName(data?.locationName);
      addCurrentWeather(data);
    },
    [addCurrentWeather]
  );
  useEffect(() => {
    if (favLocationData) {
      console.log("fav location", favLocationData);
      setFetchedWeatherData(favLocationData);
    }
  }, [favLocationData, setFetchedWeatherData]);

  const callFetchWeatherData = useCallback(
    async ({ lat, long, locationName, timeZone }) => {
      console.log(timeZone, weatherData?.coords.lat);
      if (lat !== weatherData?.coords.lat) {
        const data = await fetchWeatherData(
          lat,
          long,
          locationName,
          timeZone,
          configObject
        );
        setFetchedWeatherData(data);
      }
    },
    [setFetchedWeatherData, configObject, weatherData]
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(defaultCoords);

    function defaultCoords(position) {
      const { latitude: lat, longitude: long } = position.coords;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      callFetchWeatherData({ lat, long, timeZone });
    }
  }, []);

  useEffect(() => {
    if (updatedCurrentWeather) setFetchedWeatherData(updatedCurrentWeather);
  }, [updatedCurrentWeather]);
  const handleWeatherClick = useCallback(
    (date) => {
      if (date === currentWeather.date) setHourlyWeatherProp(hourlyWeather[0]);
      else {
        for (const element of hourlyWeather) {
          if (element.date === date) {
            setHourlyWeatherProp(element);
            break;
          }
        }
      }
      console.log(mobileView, !isVisible);
      if (mobileView && !isVisible) setIsVisible(true);
    },
    [hourlyWeather, currentWeather?.date, mobileView, isVisible]
  );

  return (
    <div className={styles.Body}>
      <div className={styles.Background}>
        <video autoPlay loop muted playsInline>
          <source src="skyBackgroundVideo.mp4" type="video/mp4" />
        </video>
      </div>
      <MemoizedSearchBar handleLocationClick={callFetchWeatherData} />
      {currentWeather && location ? (
        <>
          <MobileViewContext.Provider value={mobileView}>
            <MemoizedCurrentWeather
              currentWeather={currentWeather}
              onWeatherClick={handleWeatherClick}
              location={location}
            />
            <MemoizedDailyWeather
              dailyWeather={dailyWeather}
              onWeatherClick={handleWeatherClick}
            />

            <MemoizedHourlyWeather
              hourlyWeather={hourlyWeatherProp}
              visible={isVisible}
              removeVisible={() => setIsVisible(false)}
            />
          </MobileViewContext.Provider>
        </>
      ) : (
        <div
          className={styles.Loading}
          style={!isUserOnMobile() ? { zIndex: "1000" } : null}
        >
          <h1>FIXED!!</h1>
        </div>
      )}
    </div>
  );
}
