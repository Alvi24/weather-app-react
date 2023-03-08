// npm run dev
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar.jsx";
import { weatherCodeToIcon, WeatherData } from "../API.mjs";
import parse from "html-react-parser";
// ./ means current directory  ../ means parent of current directory and / means root directory
import styles from "../styles/App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fas, //to use fontAwesome icon as string
  faLocationDot,
  faCloudSun,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas);
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
    console.log(data);
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
    // console.log("daily   ", dailyWeather);
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
              <FontAwesomeIcon icon={"fa-location-dot"} /> {city}{" "}
            </p>
          </div>
          <FontAwesomeIcon
            icon={weatherCodeToIcon(currentWeather?.weatherCode)}
            fontSize="100px"
          />
        </div>
        <p>mintemp: {dailyWeather[0]?.minTemp + "°"} </p>
      </div>
      <div className="weather" style={{ marginBlockStart: "300px" }}>
        <FontAwesomeIcon icon="fa-sun" fontSize="100px" />
        <FontAwesomeIcon icon="fa-cloud-sun" fontSize="100px" />
        <FontAwesomeIcon icon={"fa-smog"} fontSize="100px" />
        <FontAwesomeIcon icon="fa-cloud-rain" fontSize="100px" />
        <FontAwesomeIcon icon="fa-cloud-sun-rain" fontSize="100px" />
        <FontAwesomeIcon icon="fa-cloud-meatball" fontSize="100px" />
        <FontAwesomeIcon icon="fa-snowflake" fontSize="100px" />
        <FontAwesomeIcon icon="fa-cloud-showers-heavy" fontSize="100px" />
        <img
          src="https://cdn.iconscout.com/icon/premium/png-512-thumb/weather-36-89515.png?f=avif&w=256"
          alt=""
          style={{ background: "white" }}
        />
      </div>
    </div>
  );
}
