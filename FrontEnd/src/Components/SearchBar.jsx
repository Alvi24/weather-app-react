// npm run dev
import React, { useEffect, useState } from "react";
import { fetchLocations, getcityName } from "../API.mjs";
import styles from "../styles/App.module.css";

export default function SearchBar(props) {
  let [locations, setLocations] = useState();

  // useEffect(() => {
  //   console.log(locations);
  // }, [locations]);
  function getLocations(e) {
    console.log(e.target.value !== "" ? e.target.value : "empty");
    if (e.target.value.length < 2) {
      // console.log(document.querySelector("li"));
      console.log("remove");
      setLocations([]);

      return;
    }
    fetchLocations(e)
      .then((data) => {
        // console.log(data);
        console.log(data);
        if (e.target.value.length >= 2) {
          console.log("target value", e.target.value.length);
          setLocations(data);
          // setLocations(data);
        }
      })
      .catch((errotText) => {
        setLocations(errotText);
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

      <ul>
        {Array.isArray(locations)
          ? locations?.map((location) => (
              <li
                key={location.latitude}
                onClick={() =>
                  props.handleLocationClick(
                    location.latitude,
                    location.longitude,
                    location.cityName
                  )
                }
              >
                {location.cityName} <br />
                Region: {location.region}
              </li>
            ))
          : locations}
      </ul>
    </div>
  );
}
