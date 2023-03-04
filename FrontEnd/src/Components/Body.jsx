// npm run dev
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar.jsx";
import { WeatherData } from "../API.mjs";
// ./ means current directory  ../ means parent of current directory and / means root directory
import styles from "../styles/App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCloudSun } from "@fortawesome/free-solid-svg-icons";

export default function Body() {
  let [currentWeather, setCurrentWeather] = useState({});
  let [dailyWeather, setdailyWeather] = useState({});
  let [city, setcityName] = useState();
  function callWeatherData(lat, long, cityName) {
    WeatherData(
      lat,
      long,
      cityName,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ).then(setData);
  }
  function setData(data) {
    const { dailyWeather } = data;
    // console.log(data);
    setCurrentWeather({ ...data.currentWeather });
    setdailyWeather([...data.dailyWeather]);

    if (
      typeof data.cityName === "object" &&
      typeof data.cityName.then === "function"
    ) {
      //check if cityName is promise or not
      data.cityName.then(({ city }) => {
        setcityName(city);
      });
    } else {
      setcityName(data.cityName);
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
  }, []);
  useEffect(() => {
    // console.log("weather   ", currentWeather);
  }, [currentWeather]);
  useEffect(() => {
    console.log("daily   ", dailyWeather);
  }, [dailyWeather]);
  // console.log(faCloudSun);
  // let icon = ["fas", "fa-coffee"];
  return (
    <div className={styles.Body}>
      <SearchBar handleLocationClick={callWeatherData} />
      <div className={styles.Hero}>
        {/* <button onClick={() => getLocations()}>Press</button> */}
        {/*use the ?  */}
        <div className={styles.mainWeatherInfo}>
          <p className={styles.heroTemp}> {currentWeather?.temperature}°</p>
          <div className={styles.currentLocationAndTime}>
            <p>time: {currentWeather?.currentTime}</p>
            <p>
              <FontAwesomeIcon icon={faLocationDot} /> {city}{" "}
            </p>
          </div>
        </div>
        <p>mintemp: {dailyWeather[0]?.minTemp + "°"} </p>
      </div>
    </div>
  );
}
