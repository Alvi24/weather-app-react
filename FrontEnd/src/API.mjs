// npm run dev
import axios from "axios";
// import { lookUp } from "geojson-places";

function WeatherData(latitude, longitude, cityNameFromBodyComponent, timezone) {
  return axios
    .get(
      ` https://api.open-meteo.com/v1/forecast?daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timeformat=unixtime&timezone=${timezone}`,
      {
        params: {
          latitude: latitude,
          longitude: longitude,
        },
      }
    )
    .then(({ data }) => {
      return {
        cityName:
          cityNameFromBodyComponent === undefined
            ? getcityName(latitude, longitude)
            : cityNameFromBodyComponent,
        currentWeather: handleCurrentWeatherData(data),
        dailyWeather: handleDailyWeatherData(data),
      };
    });
}

function getcityName(lat, long) {
  return axios
    .get(
      `https://api.bigdatacloud.net/data/reverse-geocode?localityLanguage=en&key=bdc_ee65efb4989c4d09a3f21513083e269d`, //server-side big data
      {
        params: {
          latitude: lat,
          longitude: long,
        },
      }
    )
    .then(({ data }) => {
      // console.log(data);
      return {
        city: data.city,
        region: data.principalSubdivision,
      };
    });
}

function handleCurrentWeatherData({ current_weather }) {
  let currentTime = new Date();
  currentTime = currentTime.getHours() + ":" + currentTime.getMinutes();
  // console.log(Math.round(37 / 10) * 10); //for weathercode
  // console.log(current_weather);
  return {
    currentTime,
    weatherCode: Math.round(current_weather.weathercode / 10) * 10,
    temperature: Math.round(current_weather.temperature),
    windSpeed: Math.round(current_weather.windspeed),
    windDirection: current_weather.winddirection,
  };
}
function handleDailyWeatherData({ daily }) {
  let {
    sunrise: sunRise,
    sunset: sunSet,
    temperature_2m_max: maxTemp,
    temperature_2m_min: minTemp,
    weathercode: weatherCodeDaily,
  } = daily;
  sunRise = sunRise.map((el) =>
    new Date(el * 1000).toLocaleTimeString("it-IT")
  );
  sunSet = sunSet.map((el) => new Date(el * 1000).toLocaleTimeString("it-IT"));
  maxTemp = maxTemp.map((el) => Math.round(el));
  minTemp = minTemp.map((el) => {
    if (Math.round(el) === -0 && el < 0) {
      return Math.round(el) * -1;
    } else {
      return Math.round(el);
    }
  });
  weatherCodeDaily = weatherCodeDaily.map((el) => Math.round(el / 10) * 10);
  let days = [
    { day: "Monday" },
    { day: "Tuesday" },
    { day: "Wednesday" },
    { day: "Thursday" },
    { day: "Saturday" },
    { day: "Sunday" },
  ];
  for (let i = 0; i < days.length; i++) {
    days[i].sunRise = sunRise[i];
    days[i].sunSet = sunSet[i];
    days[i].maxTemp = maxTemp[i];
    days[i].minTemp = minTemp[i];
    days[i].weatherCodeDaily = weatherCodeDaily[i];
  }
  return days;
}
const object = {
  hello: 30,
};
const { hello: value } = object;
console.log("value " + value);
function fetchLocations(e) {
  const { value: input } = e.target;
  return axios
    .post("http://localhost:5000/", {
      input,
    })
    .then((res) => {
      bigDatacityName(res.data, e).then((data) => {
        console.log(data);
      });
      return bigDatacityName(res.data, e);
    })
    .catch((error) => {
      console.log(error.response);
      return Promise.reject("No location found"); //or use throw
    });
}
function bigDatacityName(data, e) {
  if (e.target.value.length < 2) {
    return;
  }
  // let filteredLocations = filterLocations(data);
  // console.log("filtered", filteredLocations);
  // console.log(data);
  const promises = [];
  let cloneLocations = [...data];
  cloneLocations.forEach((location, index) => {
    promises.push(
      getcityName(location.latitude, location.longitude).then(
        ({ city, region }) => {
          let cityFromBigData = city,
            regionFromBigData = region;
          if (cityFromBigData !== "") {
            // console.log(city);
            cloneLocations[index].cityName = cityFromBigData;
            cloneLocations[index].region = regionFromBigData;
            // setLocations([...cloneLocations]);
            // console.log("locations");
          }
        }
      )
    );
  });
  return Promise.all(promises).then(() => {
    //Promise.all(arrayPromise name) wait till all promises are resolved or rejected
    return filterLocations(cloneLocations);
  });
  // console.log(cloneLocations);
  // return cloneLocations;
  // setLocations(data.map(location)=>);
}
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

export { WeatherData, fetchLocations, getcityName };
