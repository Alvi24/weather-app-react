// npm run dev
import React, { useCallback, useEffect, useState, useMemo } from "react";
import SearchBar from "./SearchBar.jsx";
import DailyWeather from "./DailyWeather.jsx";
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
  let [location, setLocationName] = useState();
  let [currentTime, setCurrentTime] = useState(
    `${new Date().getHours()} : ${new Date().getMinutes()}`
  );
  const DailyWeatherMemo = useMemo(() => {
    if (dailyWeather ?? false) {
      // use nullish coalescing or optional chaining dailyWeather[0]?.day to detect if value is undefined or null
      return <DailyWeather dailyWeather={dailyWeather.slice(1)} />; //if <DailyWeatherMemo/> is used (use useCallback)
    }
  }, [dailyWeather]);
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
      let date = new Date();
      let currentTimeInterval = `${date.getHours()} : ${date.getMinutes()} `;
      setCurrentTime(currentTimeInterval);
    }
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });
  return (
    <div className={styles.Body}>
      <SearchBar handleLocationClick={callWeatherData} />
      <div className={styles.currentWeather}>
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
      {/* <img
          src="https://cdn.iconscout.com/icon/premium/png-512-thumb/weather-36-89515.png?f=avif&w=256"
          alt=""
          style={{ background: "white" }}
        /> */}
      {DailyWeatherMemo}
      {/* {DailyWeatherMemo}  if useMemos is used*/}
      {/* <DailyWeatherMemo/>  if useCallback is used*/}
    </div>
  );
}
