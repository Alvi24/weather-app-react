import axios from "axios";
// import { lookUp } from "geojson-places";

function WeatherData(latitude, longitude, timezone) {
  return axios
    .get(
      ` https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timeformat=unixtime&timezone=${timezone}`
    )
    .then(({ data }) => {
      return {
        cityName: getCityName(latitude, longitude),
        currentWeather: handleCurrentWeatherData(data),
        dailyWeather: handleDailyWeatherData(data),
      };
    });
}

function getCityName(lat, long) {
  return axios
    .get(
      ` https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`
    )
    .then(({ data }) => {
      return data.city;
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
export default WeatherData;
