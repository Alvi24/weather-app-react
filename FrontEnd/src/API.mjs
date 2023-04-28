// npm run dev
import axios from "axios";
console.log(process.env);

async function WeatherData(
  latitude,
  longitude,
  timezone,
  locationNameFromBodyComponent = undefined
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
    .then(async ({ data }) => {
      return {
        locationName: locationNameFromBodyComponent
          ? locationNameFromBodyComponent
          : await getLocationName(latitude, longitude),
        currentWeather: handleCurrentWeatherData(data),
        dailyWeather: handleDailyWeatherData(data),
        hourlyWeather: handleHourlyWeatherData(data),
      };
    });
}

async function getLocationName(lat, long) {
  return axios
    .get(
      `https://api.bigdatacloud.net/data/reverse-geocode?localityLanguage=en&key=${process.env.REACT_APP_API_KEY}`, //server-side big data
      {
        params: {
          latitude: lat,
          longitude: long,
        },
      }
    )
    .then(({ data }) => data.city);
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
  // if (!environmentVariables) await fetchEnvironmentVariables();
  // console.log("api", environmentVariables.URL);
  if (e.target.value.length < 2) {
    return;
  }
  const { value: input } = e.target;
  return axios
    .post(process.env.REACT_APP_URL, {
      //use 192.168.100.29 (Pc address) or localhost-> but it wont work with mobile phones
      input,
    })
    .then((res) => res.data)
    .catch((error) => {
      console.log(error.response);
      return Promise.reject("No location found"); //or use throw
    });
}
function convertCelsiusToFahrenheit(cTemp) {
  return Math.round((cTemp * 9) / 5 + 32);
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
      return "fa-cloud-sun-rain"; //fa-cloud-meatball
    case 70:
      return "fa-snowflake";
    case 80:
      return "fa-cloud-rain";
    default:
      //invalid weatherCode
      return "fa-sun";
  }
}
const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div");
  if (!tooltipEl) {
    tooltipEl = document.createElement("DIV");
    tooltipEl.classList.add("tooltip");
    chart.canvas.parentNode.appendChild(tooltipEl);
    let tooltiParagraphTime = document.createElement("P");
    tooltiParagraphTime.classList.add("tooltipTime");
    let tooltiParagraphWeather = document.createElement("P");
    tooltiParagraphWeather.classList.add("tooltipWeather");
    tooltipEl.appendChild(tooltiParagraphTime);
    tooltipEl.appendChild(tooltiParagraphWeather);
    // const temp = bodyLines;
    // tooltipLiTime.innerHTML = temp;
    // console.log(bodyLines);

    console.log(tooltipEl);
  }
  return tooltipEl;
};

function externalTooltip(context) {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
  } else if (tooltipEl) {
    tooltipEl.style.opacity = "1";
  }
  if (tooltip.body) {
    const time = tooltip.title[0];
    const weather = tooltip.body[0].lines[0];

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    console.log("time", time, weather.temp, weather.weathercode);
    tooltipEl.style.left = positionX + tooltip.caretX + "px";
    tooltipEl.style.top = positionY + tooltip.caretY + "px";

    // tooltipEl.style.padding = tooltip.options.padding + "px";

    tooltipEl.querySelector(".tooltipTime").innerHTML = time + "<br>";
    tooltipEl.querySelector(".tooltipWeather").innerHTML =
      weather.temp + `° <i class="fa ${weather.weathercode}"></i>`;
  }
}
export {
  WeatherData,
  fetchLocations,
  getLocationName,
  convertCelsiusToFahrenheit,
  weatherCodeToIcon,
  externalTooltip,
};
