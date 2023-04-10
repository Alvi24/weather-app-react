// npm run dev
import React, { useCallback, useEffect, useState, createContext } from "react";
import SearchBar from "./SearchBar.jsx";
import CurrentWeather from "./CurrentWeather.jsx";
import DailyWeather from "./DailyWeather.jsx";
import HourlyWeather from "./HourlyWeather.jsx";
import { WeatherData } from "../API.mjs";
import styles from "../styles/App.module.css";

// ./ means current directory  ../ means parent of current directory and / means root directory
export const MyContext = createContext();
const MemoizedSearchBar = React.memo(SearchBar);
const MemoizedCurrentWeather = React.memo(CurrentWeather);
const MemoizedDailyWeather = React.memo(DailyWeather);
const MemoizedHourlyWeather = React.memo(HourlyWeather);

export default function Body() {


  const [location, setLocationName] = useState();
  const [{ currentWeather, dailyWeather, hourlyWeather }, setWeatherData] =
    useState({ currentWeather: null, dailyWeather: null, hourlyWeather: null });
  const [hourlyWeatherProp, setHourlyWeatherProp] = useState();
  const [mobileView, setMobileView] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mediaQuery = matchMedia("(max-width: 520px)");
    if (mediaQuery.matches) setMobileView(mediaQuery.matches);
    function handleResize() {
      const mobileView = mediaQuery.matches;
      if (mobileView) {
        console.log(mediaQuery.matches);
        setMobileView(true);
      } else {
        console.log(mediaQuery.matches);
        setMobileView(false);
        setVisible(false);
      }
    }
    mediaQuery.addEventListener("change", handleResize);
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, [mobileView]);
  //`${new Date().getHours()} : ${new Date().getMinutes()}`
  const callWeatherData = useCallback((lat, long, locationName) => {
    WeatherData(
      lat,
      long,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      locationName
    ).then(setData);

    function setData(data) {
      console.log(data);
      setWeatherData(data);
      setHourlyWeatherProp(data.hourlyWeather[0]);

      // if (
      //   typeof data.locationName === "object" &&
      //   typeof data.locationName.then === "function"
      // ) {
      //   //check if LocationName is promise or not
      //   data.locationName.then(({ location }) => {
      //     setLocationName(location);
      //     console.log(location);
      //   });
      // } else {
      //   setLocationName(data.locationName);
      // }
      setLocationName(data.locationName);
      // setLocationName(data.locationName.location ?? data.locationName);
    }
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(defaultCoords);
    let lat, long;
    function defaultCoords(position) {
      const { latitude, longitude } = position.coords;
      lat = latitude;
      long = longitude;
      callWeatherData(lat, long);
    }
  }, [callWeatherData]);

  const handleWeatherClick = useCallback(
    (date) => {
      if (date === currentWeather.date) setHourlyWeatherProp(hourlyWeather[0]);
      //first current day showing hourly weather
      else {
        for (const element of hourlyWeather) {
          if (element.date === date) {
            setHourlyWeatherProp(element);
            break;
          }
        }
      }
      if (mobileView && !visible) setVisible((prevState) => !prevState);
    },
    [hourlyWeather, currentWeather?.date, mobileView, visible]
  );
  return (
    <div className={styles.Body}>
      <MemoizedSearchBar handleLocationClick={callWeatherData} />
      {currentWeather && location ? (
        <>
          <MyContext.Provider value={mobileView}>
            <MemoizedCurrentWeather
              currentWeather={currentWeather}
              onDailyClick={handleWeatherClick}
              location={location}
            />
            <MemoizedDailyWeather
              dailyWeather={dailyWeather} //remove .slice to prevernt daily re-render
              onDailyClick={handleWeatherClick}
            />

            <MemoizedHourlyWeather
              hourlyWeather={hourlyWeatherProp}
              location={location}
              visible={visible}
              removeVisible={() => setVisible(false)}
            />
          </MyContext.Provider>
        </>
      ) : (
        <h1>Loading...</h1>
      )}

      {/* {DailyWeatherMemo}  if useMemos is used*/}
      {/* <DailyWeatherMemo/>  if useCallback is used*/}
    </div>
  );
}
