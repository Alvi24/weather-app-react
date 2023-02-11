import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar.jsx";
import { WeatherData } from "../API.mjs";
// ./ means current directory  ../ means parent of current directory and / means root directory
import styles from "../styles/App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
export default function Body() {
  let [currentWeather, setCurrentWeather] = useState({});
  let [dailyWeather, setdailyWeather] = useState({});
  let [city, setCityname] = useState();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(getCoords);
    let lat, long;
    function getCoords(position) {
      const { latitude, longitude } = position.coords;
      lat = latitude;
      long = longitude;
      WeatherData(
        lat,
        long,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ).then(setData);
    }
    function setData(data) {
      const { dailyWeather } = data;
      setCurrentWeather({ ...data.currentWeather });
      setdailyWeather([...data.dailyWeather]);
      data.cityName.then((promiseCity) => {
        setCityname(promiseCity);
      });
    }
  }, []);
  useEffect(() => {
    // console.log("weather   ", currentWeather);
  }, [currentWeather]);
  useEffect(() => {
    // console.log("daily   ", dailyWeather);
  }, [dailyWeather]);

  return (
    <div className={styles.Body}>
      <SearchBar/>
      <div className={styles.Hero}>
        {/* <button onClick={() => getLocations()}>Press</button> */}
        {/*use the ?  */}
        <h1>time: {currentWeather?.currentTime}</h1>
        <h1>
          city:
          <FontAwesomeIcon icon={faLocationDot} /> {city}{" "}
        </h1>
        <h1>mintemp: {dailyWeather[0]?.minTemp + "°"} </h1>
        <p className={styles.heroTemp}> {currentWeather?.temperature}°</p>
      </div>
    </div>
  );
}
