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
export default function DailyWeather({ dailyWeather, onDailyClick }) {
  
  const [mobileView, setMobileView] = useState();
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
      }
    }
    mediaQuery.addEventListener("change", handleResize);
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, [mobileView]);
  return (
    <div className={styles["dailyContainer"]}>
      {dailyWeather.map(({ weatherCodeDaily, day, date, maxTemp, minTemp }) => (
        <div
          className={`${styles.daily} dailyGlobalClass`}
          key={date}
          onClick={() => onDailyClick(date)}
        >
          {mobileView ? (
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
              <FontAwesomeIcon
                icon={weatherCodeToIcon(weatherCodeDaily)}
                className={styles.dailyWeatherIconMediaQueryMatches}
              />
            </>
          ) : (
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
          )}
        </div>
      ))}
    </div>
  );
}
