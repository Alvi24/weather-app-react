// npm run dev
import axios from "axios";
// import { lookUp } from "geojson-places";

async function WeatherData(
  latitude,
  longitude,
  cityNameFromBodyComponent,
  timezone
) {
  return axios

    .get(
      `  https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timeformat=unixtime&timezone=${timezone}`,
      {
        params: {
          latitude: latitude,
          longitude: longitude,
        },
      }
    )
    .then(({ data }) => {
      console.log(data);
      return {
        cityName:
          cityNameFromBodyComponent === undefined
            ? getcityName(latitude, longitude)
            : cityNameFromBodyComponent,
        currentWeather: handleCurrentWeatherData(data),
        dailyWeather: handleDailyWeatherData(data),
        hourlyWeather: handleHourlyWeatherData(data),
      };
    });
}

async function getcityName(lat, long) {
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
  console.log(currentTime.getDate(), currentTime.getDay()); //WHEN WORKING WITH HOURLY WEATHER
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
function convertUnixTimeToNormalTime(arrayOfUnixTime) {
  return arrayOfUnixTime.map((el) =>
    new Date(el * 1000).toLocaleTimeString("it-IT")
  );
}
function roundTemperatureNumber(arrayOfTemperature) {
  arrayOfTemperature = arrayOfTemperature.map((el) => {
    if (Math.round(el) === -0 && el < 0) {
      return Math.round(el) * -1;
    } else {
      return Math.round(el);
    }
  });
  return arrayOfTemperature;
}
function convertUnixTimeToDay(unixTime) {
  const dayOfWeek = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  const day = dayOfWeek[new Date(unixTime * 1000).getDay()];
  return day;
}
function handleDailyWeatherData({ daily }) {
  let {
    sunrise: sunRise,
    sunset: sunSet,
    temperature_2m_max: maxTemp,
    temperature_2m_min: minTemp,
    weathercode: weatherCodeDaily,
    time,
  } = daily;
  console.log(daily);
  sunRise = convertUnixTimeToNormalTime(sunRise);
  sunSet = convertUnixTimeToNormalTime(sunSet);
  // sunRise = sunRise.map((el) =>
  //   new Date(el * 1000).toLocaleTimeString("it-IT")
  // );
  // sunSet = sunSet.map((el) => new Date(el * 1000).toLocaleTimeString("it-IT"));
  maxTemp = roundTemperatureNumber(maxTemp);
  minTemp = roundTemperatureNumber(minTemp);
  weatherCodeDaily = weatherCodeDaily.map((el) => Math.round(el / 10) * 10);
  const dayOfWeek = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  const dayOfWeekLength = Object.keys(dayOfWeek).length; //number of properties
  let days = [];
  for (let i = 0; i < dayOfWeekLength; i++) {
    days[i] = {};
    days[i].day = convertUnixTimeToDay(time[i]);
    days[i].sunRise = sunRise[i];
    days[i].sunSet = sunSet[i];
    days[i].maxTemp = maxTemp[i];
    days[i].minTemp = minTemp[i];
    days[i].weatherCodeDaily = weatherCodeDaily[i];
  }
  return days;
}

function handleHourlyWeatherData({ hourly }) {
  const dayOfWeek = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  // console.log(dayOfWeek[0]);
  // console.log(hourly);
  let hourlyLimit = hourly.time.length;
  let {
    time: timeHourly,
    temperature_2m: tempHourly,
    weathercode: weatherCodeHourly,
  } = hourly;
  let hourlyDataClone = []; // or  let hourlyDataClone = [{},{},{},{},{},{},{}];
  let hourlyIterator = 0;
  tempHourly = roundTemperatureNumber(tempHourly);
  timeHourly = convertUnixTimeToNormalTime(timeHourly);
  weatherCodeHourly = weatherCodeHourly.map((el) => Math.round(el / 10) * 10);

  for (let i = 24; i <= hourlyLimit; i += 24) {
    hourlyDataClone[hourlyIterator] = {};
    hourlyDataClone[hourlyIterator].day = convertUnixTimeToDay(
      hourly.time[i - 23]
    );

    hourlyDataClone[hourlyIterator].time = timeHourly.slice(i - 24, i); //0-23
    hourlyDataClone[hourlyIterator].temp = tempHourly.slice(i - 24, i);
    hourlyDataClone[hourlyIterator].weathercode = weatherCodeHourly.slice(
      i - 24,
      i
    );
    hourlyIterator++;
  }
  // console.log(hourlyDataClone);
  return hourlyDataClone;
}
const object = {
  hello: 30,
};
const { hello: value } = object;
console.log("value " + value);
async function fetchLocations(e) {
  const { value: input } = e.target;
  return axios
    .post("http://localhost:5000/", {
      input,
    })
    .then((res) => {
      bigDatacityName(res.data, e).then((data) => {
        // console.log(data);
      });
      return bigDatacityName(res.data, e);
    })
    .catch((error) => {
      console.log(error.response);
      return Promise.reject("No location found"); //or use throw
    });
}
function bigDatacityName(data, e) {
  //   console.log("data before sort", data);
  //  data.sort((a, b) => {
  //     if (a.cityName < b.cityName) {
  //       return -1;
  //     }
  //     if (a.cityName > b.cityName) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  //   console.log("data after sort",data);
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
  // console.log(locations);
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
function weatherCodeToIcon(weatherCode) {
  switch (weatherCode) {
    case 0:
      break;
    case 10:
      break;
    case 20:
      break;
    case 30:
      break;
    case 40:
      break;
    case 50:
      break;
    case 60:
      break;
    case 70:
      break;
    default:
      break;
  }
}

export { WeatherData, fetchLocations, getcityName };
