// npm run dev
import React, { useState } from "react";
import { fetchLocations } from "../Utilities.mjs";
import styles from "../styles/App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
export default function SearchBar(props) {
  let [locations, setLocations] = useState([]);

  console.log("SearchBar rendered");
  const debounce = (callbackFunction, delay = 250) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callbackFunction(...args);
      }, delay);
    };
  };
  const debouncedFetchLocation = debounce((e) => {
    console.log("start", Date());
    const isInputFilled = e.target.value.trim().length >= 2;
    fetchLocations(e)
      .then(({ weatherData, prevSearchText }) => {
        console.log("end", Date());
        if (isInputFilled && e.target.value === prevSearchText) {
          //when the searched text and the current searched text are equal set data
          console.log("target value length", e.target.value.length);
          setLocations(weatherData);
        }
      })
      .catch((errotText) => {
        if (isInputFilled) setLocations(errotText);
      });
  }, 150);

  function getLocations(e) {
    console.log(e.target.value !== "" ? e.target.value : "empty");
    if (e.target.value.trim().length < 2) {
      if (locations.length !== 0) setLocations([]);
      return;
    }
    debouncedFetchLocation(e);
  }
  return (
    <div className={styles.searchBarAndLocationContainer}>
      <div className={styles.searchBar}>
        <input
          type="text"
          name="searchBar"
          id="searchBar"
          placeholder=" "
          autoComplete="off"
          onChange={(e) => getLocations(e)}
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={styles.searchIcon}
        />
      </div>
      {typeof locations === "object" ? (
        <table border={3}>
          <tbody>
            <tr>
              <th>Flag</th>
              <th>Location</th>
              <th>Region</th>
            </tr>
            {locations?.map((location) => (
              <tr
                className={styles.location}
                key={location.latitude}
                onClick={() => {
                  console.log(location);
                  const {
                    latitude: lat,
                    longitude: long,
                    locationName,
                    timezone: timeZone,
                  } = location;
                  props.handleLocationClick({
                    lat,
                    long,
                    locationName,
                    timeZone,
                  });
                }}
              >
                <td className={styles.countryFlag}>
                  <img src={location.countryFlag} alt="no flag found" />
                </td>
                <td className={styles.locationName}>{location.locationName}</td>
                <td>{location.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.noLocationFoundText}>{locations}</p>
      )}
    </div>
  );
}
