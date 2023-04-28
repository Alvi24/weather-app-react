import React, { useContext } from "react";
import { MyContext } from "./Body";
import { configContext } from "../App";
import styles from "../styles/DailyWeather.module.css";
import { convertCelsiusToFahrenheit, weatherCodeToIcon } from "../API.mjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fas, //to use fontAwesome icon as string
  faTemperatureHigh,
  faTemperatureLow,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas);
export default function DailyWeather({ dailyWeather, onDailyClick }) {
  const mobileView = useContext(MyContext);
  const { configObject } = useContext(configContext);
  return (
    <div className={styles["dailyContainer"]}>
      {dailyWeather
        .slice(1)
        .map(({ weatherCodeDaily, day, date, maxTemp, minTemp }) => {
          //Converting clesius to fahrenheit if needed (the prop itself is not changed)
          if (configObject.degree === "fahrenheit") {
            maxTemp = convertCelsiusToFahrenheit(maxTemp);
            minTemp = convertCelsiusToFahrenheit(minTemp);
          }
          return (
            <div
              className={styles.daily}
              key={date}
              onClick={() => onDailyClick(date)}
            >
              {mobileView ? (
                <>
                  <div className={styles.dailyDayAndHighLow}>
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
                    className={styles.dailyWeatherIcon}
                  />
                </>
              ) : (
                <>
                  {" "}
                  <h3 className={styles.dailyDay}>
                    {day} {date}
                  </h3>{" "}
                  <div className={styles.dailyWeatherInfoContainer}>
                    <FontAwesomeIcon
                      icon={weatherCodeToIcon(weatherCodeDaily)}
                    />

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
          );
        })}
    </div>
  );
}
