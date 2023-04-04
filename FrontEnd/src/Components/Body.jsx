// npm run dev
import React, { useCallback, useEffect, useState, useMemo } from "react";

import SearchBar from "./SearchBar.jsx";
import CurrentWeather from "./CurrentWeather.jsx";
import DailyWeather from "./DailyWeather.jsx";
import HourlyWeather from "./HourlyWeather.jsx";
import { WeatherData } from "../API.mjs";
import styles from "../styles/App.module.css";

// ./ means current directory  ../ means parent of current directory and / means root directory
const MemoizedSearchBar = React.memo(SearchBar);
const MemoizedCurrentWeather = React.memo(CurrentWeather);

export default function Body() {
  let [currentWeather, setCurrentWeather] = useState(false);
  let [dailyWeather, setdailyWeather] = useState();
  let [hourlyWeather, setHourlyWeather] = useState();
  let [hourlyWeatherProp, setHourlyWeatherProp] = useState();
  let [location, setLocationName] = useState();
  let [weatherData, setWeatherData] = useState(null);

  //`${new Date().getHours()} : ${new Date().getMinutes()}`
  const callWeatherData = useCallback((lat, long, locationName) => {
    WeatherData(
      lat,
      long,
      locationName,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ).then(setData);

    function setData(data) {
      setCurrentWeather({ ...data.currentWeatherAPI });
      setdailyWeather([...data.dailyWeatherAPI]);
      setHourlyWeather([...data.hourlyWeatherAPI]);
      setHourlyWeatherProp(data.hourlyWeatherAPI[0]);
      setWeatherData(data);
      if (
        typeof data.locationName === "object" &&
        typeof data.locationName.then === "function"
      ) {
        //check if LocationName is promise or not
        data.locationName.then(({ location }) => {
          setLocationName(location);
          console.log(location);
        });
      } else {
        setLocationName(data.locationName);
      }
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
  // useEffect(() => {
  //   function updateTime() {
  //     // console.log("1 second passed")
  //     let date = new Date();
  //     let currentTimeInterval;
  //     if (date.getMinutes() < 10)
  //       currentTimeInterval = `${date.getHours()} : ${
  //         "0" + date.getMinutes()
  //       } `;
  //     else {
  //       currentTimeInterval = `${date.getHours()} : ${date.getMinutes()} `;
  //     }
  //     setTime(currentTimeInterval);
  //   }
  //   const interval = setInterval(updateTime, 1000);
  //   return () => clearInterval(interval);
  // }, []);

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
    },
    [hourlyWeather, currentWeather.date]
  );

  const DailyWeatherMemo = useMemo(() => {
    if (dailyWeather ?? false) {
      // use nullish coalescing or optional chaining dailyWeather[0]?.day to detect if value is undefined or null
      return (
        <DailyWeather
          dailyWeather={dailyWeather.slice(1)}
          onDailyClick={handleWeatherClick}
        />
      );
      // if use useCallback is used <DailyWeatherMemo />
    }
  }, [dailyWeather, handleWeatherClick]);

  const HourlyWeatherMemo = useMemo(() => {
    if (hourlyWeatherProp ?? false) {
      return (
        <HourlyWeather hourlyWeather={hourlyWeatherProp} location={location} />
      );
    }
  }, [hourlyWeatherProp, location]);

  return (
    <div className={styles.Body}>
      {currentWeather && location ? (
        <>
          <MemoizedSearchBar handleLocationClick={callWeatherData} />
          <MemoizedCurrentWeather
            currentWeather={currentWeather}
            onDailyClick={handleWeatherClick}
            location={location}
          />
        </>
      ) : null}
      {DailyWeatherMemo}
      {HourlyWeatherMemo}
      {/* {DailyWeatherMemo}  if useMemos is used*/}
      {/* <DailyWeatherMemo/>  if useCallback is used*/}
    </div>
  );
}
