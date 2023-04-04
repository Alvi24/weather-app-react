// npm run dev
import axios from "axios";

async function WeatherData(
  latitude,
  longitude,
  locationNameFromBodyComponent,
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
      return {
        locationName:
          locationNameFromBodyComponent === undefined
            ? getLocationName(latitude, longitude)
            : locationNameFromBodyComponent,
        currentWeatherAPI: handleCurrentWeatherData(data),
        dailyWeatherAPI: handleDailyWeatherData(data),
        hourlyWeatherAPI: handleHourlyWeatherData(data),
      };
    });
}

async function getLocationName(lat, long) {
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
      return {
        location: data.city, // .city not .location
        region: data.principalSubdivision,
      };
    });
}

function handleCurrentWeatherData({ current_weather }) {
  return {
    date: new Date(current_weather.time * 1000).getDate(),
    weatherCode: Math.round(current_weather.weathercode / 10) * 10, //round to neart 10,20,30 etc
    temperature: Math.round(current_weather.temperature),
    windSpeed: Math.round(current_weather.windspeed),
    windDirection: current_weather.winddirection,
  };
}
function convertUnixTimeToNormalTime(arrayOfUnixTime) {
  const options = { hour: "numeric" };
  return arrayOfUnixTime.map((time) =>
    Intl.DateTimeFormat("en-US", options).format(time * 1000)
  );
  //new Date(el * 1000).getHours()
  // new Date(el * 1000).toLocaleTimeString("it-IT")
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
  let dates = time.map((unixTime) => new Date(unixTime * 1000).getDate());
  sunRise = convertUnixTimeToNormalTime(sunRise);
  sunSet = convertUnixTimeToNormalTime(sunSet);
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
  // console.log(dayOfWeek[0]);
  const dayOfWeekLength = Object.keys(dayOfWeek).length; //number of properties
  let days = [];
  for (let i = 0; i < dayOfWeekLength; i++) {
    days[i] = {};
    days[i].day = convertUnixTimeToDay(time[i]);
    days[i].date = dates[i];
    days[i].sunRise = sunRise[i];
    days[i].sunSet = sunSet[i];
    days[i].maxTemp = maxTemp[i];
    days[i].minTemp = minTemp[i];
    days[i].weatherCodeDaily = weatherCodeDaily[i];
  }
  return days;
}

function handleHourlyWeatherData({ hourly }) {
  let hourlyLimit = hourly.time.length;
  let {
    time: timeHourly,
    temperature_2m: tempHourly,
    weathercode: weatherCodeHourly,
  } = hourly;
  let hourlyDataClone = []; // or  let hourlyDataClone = [{},{},{},{},{},{},{}];
  let hourlyIterator = 0;
  let dateHourly;
  tempHourly = roundTemperatureNumber(tempHourly);
  timeHourly = convertUnixTimeToNormalTime(timeHourly);
  weatherCodeHourly = weatherCodeHourly.map((el) => Math.round(el / 10) * 10);

  for (let i = 24; i <= hourlyLimit; i += 24) {
    hourlyDataClone[hourlyIterator] = {};
    hourlyDataClone[hourlyIterator].day = convertUnixTimeToDay(
      hourly.time[i - 23]
    );
    dateHourly = new Date(hourly.time[i - 23] * 1000).getDate();
    hourlyDataClone[hourlyIterator].date = dateHourly;
    hourlyDataClone[hourlyIterator].time = timeHourly.slice(i - 24, i); //0-23
    hourlyDataClone[hourlyIterator].temp = tempHourly.slice(i - 24, i);
    hourlyDataClone[hourlyIterator].weathercode = weatherCodeHourly.slice(
      i - 24,
      i
    );
    hourlyIterator++;
  }
  hourlyDataClone[0].day = "Today";
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
    .post("http://192.168.100.29:5000/", {
      //use 192.168.100.29 (Pc address) or localhost-> but it wont work with mobile phones
      input,
    })
    .then((res) => {
      return bigDataLocationName(res.data, e);
    })
    .catch((error) => {
      console.log(error.response);
      return Promise.reject("No location found"); //or use throw
    });
}
function bigDataLocationName(data, e) {
  if (e.target.value.length < 2) {
    return;
  }
  const promises = [];
  let cloneLocations = [...data];
  cloneLocations.forEach((location, index) => {
    promises.push(
      getLocationName(location.latitude, location.longitude).then(
        ({ location, region }) => {
          let locationFromBigData = location,
            regionFromBigData = region;
          if (locationFromBigData !== "") {
            cloneLocations[index].locationName = locationFromBigData;
            cloneLocations[index].region = regionFromBigData;
          }
        }
      )
    );
  });

  return Promise.all(promises).then(() => {
    // data.sort((a, b) => {  //sort an array of objects
    //   if (a.locationName < b.locationName) {
    //     return -1;
    //   }
    //   if (a.locationName > b.locationName) {
    //     return 1;
    //   }
    //   return 0;
    // });
    console.log("final", filterDuplicateLocations(cloneLocations));
    return filterDuplicateLocations(cloneLocations);
  });
}
//docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins

//be33dc8f2d2f45cda4b2bf8a00eb2cbf
//be33dc8f2d2f45cda4b2bf8a00eb2cbf
function filterDuplicateLocations(arrayOfLocations) {
  return arrayOfLocations.filter(
    (location, index, self) =>
      index ===
      self.findIndex(
        (cloneLocationElement) =>
          cloneLocationElement.locationName === location.locationName &&
          cloneLocationElement.region === location.region
      )
  );
}

function weatherCodeToIcon(weatherCode) {
  switch (weatherCode) {
    case 0:
      return "fa-sun";
    case 10:
      return "fa-smog";
    case 20:
      return "fa-cloud-sun";
    case 30:
      return "fa-cloud-showers-heavy";
    case 40:
      return "fa-smog";
    case 50:
      return "fa-cloud-sun-rain";
    case 60:
      return "fa-cloud-sun-rain";  //fa-cloud-meatball
    case 70:
      return "fa-snowflake";
    case 80:
      return "fa-cloud-rain";
    default:
      //invalid weatherCode
      return "fa-sun";
  }
}

export { WeatherData, fetchLocations, getLocationName, weatherCodeToIcon };
