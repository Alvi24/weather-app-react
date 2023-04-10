import React, { useEffect, useMemo, useState } from "react";
import { weatherCodeToIcon } from "../API.mjs";
import styles from "../styles/CurrentWeather.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fas, //to use fontAwesome icon as string
  faLocationDot,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(fas);
export default function CurrentWeather({
  currentWeather,
  onDailyClick,
  location,
}) {
  let [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      if (currentTime.getMinutes() !== time.getMinutes()) {
        setTime(currentTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);
  const formattedTime = useMemo(() => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(time);
  }, [time]);
  return (
    <div
      className={styles.currentWeather}
      onClick={() => onDailyClick(currentWeather?.date)}
    >
      {/* <button onClick={() => getLocations()}>Press</button> */}
      {/*use the ?  */}
      <div className={styles.mainWeatherInfo}>
        <p className={styles.currentWeatherTemp}>
          {currentWeather?.temperature}°
        </p>
        <div className={styles.currentLocationAndTime}>
          <p>
            <FontAwesomeIcon icon={faClock} /> {formattedTime}
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
  );
}
