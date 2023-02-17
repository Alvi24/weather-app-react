// npm run dev
import React, { useEffect, useState } from "react";
import { fetchLocations, getcityName } from "../API.mjs";
import styles from "../styles/App.module.css";

export default function SearchBar(props) {
  let [locations, setLocations] = useState();
  function filterLocations(locations) {
    console.log(locations);
    // console.log(
    //   cloneLocation.cityName,
    //   cloneLocations[index + 1].cityName
    // );
    // console.log(
    //   cloneLocation.countryFlag,
    //   cloneLocations[index + 1].countryFlag
    // );
    // console.log("index", index);
    let filteredLocations = [];
    locations.forEach((location, index) => {
      // console.log(index);
      if (index === locations.length - 1) {
        filteredLocations.push({ ...location });
        return;
      }
      if (
        location.cityName !== locations[index + 1].cityName ||
        location.region !== locations[index + 1].region
      ) {
        console.log(
          "cityName",
          location.cityName !== locations[index + 1].cityName,
          location.cityName,
          locations[index + 1].cityName
        );
        console.log(
          "region",
          location.region !== locations[index + 1].region,
          location.region,
          locations[index + 1].region
        );
        console.log(" ");
        filteredLocations.push({ ...location });
      }
    });

    // console.log(
    //   "cityName",
    //   firstLocation.cityName === secondLocation.cityName
    // );
    // console.log(
    //   "flag",
    //   firstLocation.countryFlag === secondLocation.countryFlag
    // )
    // console.log(filteredLocations);
    return filteredLocations;
  }

  function bigDatacityName(data, e) {
    if (e.target.value.length < 2) {
      return;
    }

    // console.log("filtered", filteredLocations);
    // console.log(data);
    // let filteredLocations = ;
    let cloneLocations = [...data];
    cloneLocations.forEach((location, index) => {
      getcityName(location.latitude, location.longitude)
        .then(({ city, region }) => {
          console.log("changing");
          let cityFromBigData = city,
            regionFromBigData = region;
          if (cityFromBigData !== "") {
            // console.log(city);
            cloneLocations[index].cityName = cityFromBigData;
            cloneLocations[index].region = regionFromBigData;
            // setLocations([...cloneLocations]);
            // console.log("locations");
          }
        })
        .finally(() => {
          console.log("finished");
          setLocations(filterLocations(cloneLocations));
        });
    });
    // setLocations(data.map(location)=>);
  }
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
    fetchLocations(e.target.value).then((data) => {
      // console.log(data);
      if (e.target.value.length >= 2) {
        console.log("target value", e.target.value.length);
        bigDatacityName(data, e);
        // setLocations(data);
      }
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
        {locations?.map((location) => (
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
        ))}
      </ul>
    </div>
  );
}
