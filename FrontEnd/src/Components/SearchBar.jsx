// npm run dev
import React, { useEffect, useState } from "react";
import { fetchLocations } from "../API.mjs";
import styles from "../styles/App.module.css";

export default function SearchBar(props) {
  let [locations, setLocations] = useState();

  useEffect(() => {
    console.log(locations);
  }, [locations]);
  // useEffect(() => {
  //   console.log(locations);
  // }, [locations]);
  function getLocations(e) {
    console.log(e.target.value !== "" ? e.target.value : "empty");
    if (e.target.value.length < 2) {
      // console.log(document.querySelector("li"));
      console.log("remove");
      // if (document.querySelector("table")) {
      //   document.querySelector("table").style.display = "none";
      // }
      setLocations([]);

      return;
    }

    fetchLocations(e)
      .then((data) => {
        if (e.target.value.length >= 2) {
          console.log("target value", e.target.value.length);
          console.log(data);
          setLocations(data);
          // setLocations(data);
        }
      })
      .catch((errotText) => {
        if (e.target.value.length >= 2) setLocations(errotText);
      });
  }
  return (
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
                    location.cityName
                  )
                }
              >
                <td>
                  <img src={location.countryFlag} alt="" />
                </td>
                <td>{location.cityName}</td>
                <td>{location.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        locations
      )}
    </div>
  );
}
