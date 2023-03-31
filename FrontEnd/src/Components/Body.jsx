// npm run dev
import React, { useCallback, useEffect, useState, useMemo } from "react";
import SearchBar from "./SearchBar.jsx";
import DailyWeather from "./DailyWeather.jsx";
import HourlyWeather from "./HourlyWeather.jsx";
import { weatherCodeToIcon, WeatherData } from "../API.mjs";
// import parse from "html-react-parser";
// ./ means current directory  ../ means parent of current directory and / means root directory
import styles from "../styles/App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fas, //to use fontAwesome icon as string
  faLocationDot,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas);
export default function Body() {
  let [currentWeather, setCurrentWeather] = useState({});
  let [dailyWeather, setdailyWeather] = useState();
  let [hourlyWeather, setHourlyWeather] = useState();
  let [hourlyWeatherProp, setHourlyWeatherProp] = useState();
  let [location, setLocationName] = useState();
  let [currentTime, setCurrentTime] = useState(
    `${new Date().getHours()} : ${new Date().getMinutes()}`
  );
  const callWeatherData = useCallback((lat, long, locationName) => {
    WeatherData(
      lat,
      long,
      locationName,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ).then(setData);
  }, []);
  function setData(data) {
    setCurrentWeather({ ...data.currentWeatherAPI });
    setdailyWeather([...data.dailyWeatherAPI]);
    console.log(data.dailyWeatherAPI);
    setHourlyWeather([...data.hourlyWeatherAPI]);
    setHourlyWeatherProp(data.hourlyWeatherAPI[0]);
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
  useEffect(() => {
    function updateTime() {
      // console.log("1 second passed")
      let date = new Date();
      let currentTimeInterval;
      if (date.getMinutes() < 10)
        currentTimeInterval = `${date.getHours()} : ${
          "0" + date.getMinutes()
        } `;
      else {
        currentTimeInterval = `${date.getHours()} : ${date.getMinutes()} `;
      }
      setCurrentTime(currentTimeInterval);
    }
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
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
  }, [dailyWeather]);
  const HourlyWeatherMemo = useMemo(() => {
    if (hourlyWeatherProp ?? false) {
      return <HourlyWeather hourlyWeather={hourlyWeatherProp} />;
    }
  }, [hourlyWeatherProp]);
  function handleWeatherClick(date) {
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
  }

  return (
    <div className={styles.Body}>
      <SearchBar handleLocationClick={callWeatherData} />
      <div
        className={styles.currentWeather}
        onClick={() => handleWeatherClick(currentWeather?.date)}
      >
        {/* <button onClick={() => getLocations()}>Press</button> */}
        {/*use the ?  */}
        <div className={styles.mainWeatherInfo}>
          <p className={styles.currentWeatherTemp}>
            {currentWeather?.temperature}°
          </p>
          <div className={styles.currentLocationAndTime}>
            <p>
              <FontAwesomeIcon icon={faClock} /> {currentTime}
            </p>
            <p>
              <FontAwesomeIcon icon={faLocationDot} /> {location}{" "}
            </p>
          </div>
        </div>
        <FontAwesomeIcon
          icon={weatherCodeToIcon(currentWeather?.weatherCode)}
          className={styles["currentWeatherIcon"]}
          fontSize="70px"
        />
        {/* <p>mintemp: {dailyWeather[0]?.minTemp + "°"} </p> */}
      </div>
      {DailyWeatherMemo}
      {HourlyWeatherMemo}
      {/* {DailyWeatherMemo}  if useMemos is used*/}
      {/* <DailyWeatherMemo/>  if useCallback is used*/}
    </div>
  );
}
