// npm run dev
import React, { useState } from "react";
import { fetchLocations } from "../API.mjs";
import styles from "../styles/App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
export default function SearchBar(props) {
  let [locations, setLocations] = useState();
  console.log("SearchBar rendered");
  function getLocations(e) {
    console.log(e.target.value !== "" ? e.target.value : "empty");
    if (e.target.value.length < 2) {
      console.log("remove");
      setLocations([]);

      return;
    }

    fetchLocations(e)
      .then((data) => {
        if (e.target.value.length >= 2) {
          console.log("target value", e.target.value.length);

          setLocations(data);
        }
      })
      .catch((errotText) => {
        if (e.target.value.length >= 2) setLocations(errotText);
      });
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
          onChange={(e) => {
            getLocations(e);
          }}
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
                onClick={() =>
                  props.handleLocationClick(
                    location.latitude,
                    location.longitude,
                    location.locationName
                  )
                }
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
