import useCurrentTime from "../../CustomHooks/useCurrentTime.js";
import { weatherCodeToIcon } from "../../Utilities.mjs";
import styles from "../../styles/CurrentWeather.module.css";
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
  onWeatherClick,
  location,
}) {
  const currentTime = useCurrentTime();
  return (
    <div
      className={styles.currentWeather}
      onClick={() => onWeatherClick(currentWeather.date)}
    >
      {/* <button onClick={() => getLocations()}>Press</button> */}
      {/*use the ?  */}
      <div className={styles.mainWeatherInfo}>
        <p className={styles.currentWeatherTemp}>
          {currentWeather.temperature}°
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
        icon={weatherCodeToIcon(currentWeather.weatherCode)}
        className={styles["currentWeatherIcon"]}
        fontSize="70px"
      />
      {/* <p>mintemp: {dailyWeather[0].minTemp + "°"} </p> */}
    </div>
  );
}
