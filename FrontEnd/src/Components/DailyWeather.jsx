import React, { useEffect, useState } from "react";
import styles from "../styles/DailyWeather.module.css";
import { weatherCodeToIcon } from "../API.mjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fas, //to use fontAwesome icon as string
  faTemperatureHigh,
  faTemperatureLow,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas);
export default function DailyWeather({ dailyWeather }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  console.log(dailyWeather);
  const threshold = 450; // adjust this as needed
  return (
    <div className={styles["dailyContainer"]}>
      {dailyWeather.map(({ weatherCodeDaily, day, date, maxTemp, minTemp }) => (
        <div className={styles.daily} key={date}>
          {screenWidth > threshold ? (
            <>
              {" "}
              <h3 className={styles.dailyDay}>
                {day} {date}
              </h3>{" "}
              <div className={styles.dailyWeatherInfoContainer}>
                <FontAwesomeIcon icon={weatherCodeToIcon(weatherCodeDaily)} />

                <div className={styles.dailyWeatherHighLow}>
                  <p>
                    <FontAwesomeIcon icon={faTemperatureHigh} /> {maxTemp}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faTemperatureLow} /> {minTemp}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.dailydayAndHighLow}>
                <h3 className={styles.dailyDay}>
                  {day} {date}
                </h3>
                <div className={styles.dailyWeatherHighLow}>
                  <p>
                    <FontAwesomeIcon icon={faTemperatureHigh} /> {maxTemp}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faTemperatureLow} /> {minTemp}
                  </p>
                </div>
              </div>
                <FontAwesomeIcon icon={weatherCodeToIcon(weatherCodeDaily)} className={styles.dailyWeatherIconMediaQueryMatches} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
