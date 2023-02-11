import React, { useState } from "react";
import { fetchLocations } from "../API.mjs";
import styles from "../styles/App.module.css";

export default function SearchBar() {
  let [locations, setLocations] = useState();
  function getLocations(e) {
    console.log(e.target.value !== "" ? e.target.value : "empty");
    if (e.target.value.length < 2) {
      console.log(document.querySelector("li"));
      if (locations.length !== 0) {
        console.log("remove");
        setLocations([]);
      }
      return;
    }
    fetchLocations(e.target.value).then((data) => {
      console.log(data);
      if (e.target.value.length >= 2) setLocations(data);
    });
  }
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        name="searchBar"
        id="searchBar"
        placeholder=" "
        onChange={(e) => {
          getLocations(e);
        }}
      />

      <ul>
        {locations?.map((el) => (
          <li key={el.latitude}>{el.cityName}</li>
        ))}
      </ul>
    </div>
  );
}
