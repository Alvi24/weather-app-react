// npm run dev
import axios from "axios";
console.log(process.env);

async function fetchWeatherData(
  latitude,
  longitude,
  locationNameFromSearchedLocation,
  timeZone,
  configObject
) {
  console.log(timeZone);
  console.log(configObject);
  return axios

    .get(
      `  https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timeformat=unixtime`,
      {
        params: {
          latitude,
          longitude,
          temperature_unit: configObject.degree,
          timezone: "Europe/Berlin", //auto
        },
      }
    )
    .then(async ({ data }) => {
      return {
        locationName:
          locationNameFromSearchedLocation ??
          (await getLocationNameAndTimeZone(latitude, longitude)),
        coords: {
          lat: latitude, //+ converts string number to number
          lon: longitude,
        },
        timeZone: timeZone,
        currentWeather: handleCurrentWeatherData(data),
        dailyWeather: handleDailyWeatherData(data, configObject.timeFormat),
        hourlyWeather: handleHourlyWeatherData(data, configObject.timeFormat),
      };
    });
}

async function getLocationNameAndTimeZone(latitude, longitude) {
  return axios
    .post(process.env.REACT_APP_URL + "big-data-api", {
      lat: latitude,
      long: longitude,
    })
    .then(({ data }) => data.location);
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
function convertUnixTimeToNormalTime(arrayOfUnixTime, timeFormat) {
  const options = { hour: "numeric",minutes:"numeric" };
  return arrayOfUnixTime.map((time) =>
    Intl.DateTimeFormat(timeFormat, options).format(time * 1000)
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
function handleDailyWeatherData({ daily }, timeFormat) {
  let {
    sunrise: sunRise,
    sunset: sunSet,
    temperature_2m_max: maxTemp,
    temperature_2m_min: minTemp,
    weathercode: weatherCodeDaily,
    time,
  } = daily;
  let dates = time.map((unixTime) => new Date(unixTime * 1000).getDate());
  sunRise = convertUnixTimeToNormalTime(sunRise, timeFormat);
  sunSet = convertUnixTimeToNormalTime(sunSet, timeFormat);
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

function handleHourlyWeatherData({ hourly }, timeFormat) {
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
  timeHourly = convertUnixTimeToNormalTime(timeHourly, timeFormat);
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
function convertTemperature(temp, degree) {
  return degree === "celsius"
    ? Math.round(((temp - 32) * 5) / 9) //celsius
    : Math.round((temp * 9) / 5 + 32); //fahrenheit
}

async function updateStoredFavLocations(savedFavLocations, configObject) {
  // if (localStorage.getItem("favoriteLocations") === "undefined") return [];
  // const savedFavLocations = [
  //   ...JSON.parse(localStorage.getItem("favoriteLocations")),
  // ];
  console.log(savedFavLocations);
  const updatedFavLocations = savedFavLocations.map((data) =>
    fetchWeatherData(
      data.coords.lat,
      data.coords.lon,
      data.locationName,
      data.timeZone,
      configObject
    )
  );
  console.log(updatedFavLocations);
  return Promise.all(updatedFavLocations).then((favLocations) => favLocations);
}
// function getTimeZone(lat, lon) {
//   return fetch(
//     `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${process.env.REACT_APP_GEOAPIFY_TIME_ZONE_API_KEY}`
//   )
//     .then((resp) => resp.json())
//     .then(({ results }) => {
//       if (results.length) {
//         return results[0].timezone.name;
//       }
//     });
// }
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
function updateWeatherDegreeChanged(weatherData, degree) {
  const { currentWeather, dailyWeather, hourlyWeather } = weatherData;

  // for (const propName in configObject) {
  //   console.log(propName);
  // }
  const updatedCurrentWeather = {
    ...currentWeather,
    temperature: convertTemperature(currentWeather.temperature, degree),
  };

  const updatedDailyWeather = dailyWeather.map((day) => {
    return {
      ...day,
      maxTemp: convertTemperature(day.maxTemp, degree),
      minTemp: convertTemperature(day.minTemp, degree),
    };
  });
  const updatedHourlyWeather = hourlyWeather.map((hour) => {
    return {
      ...hour,
      temp: hour.temp.map((temp) => convertTemperature(temp, degree)),
    };
  });
  console.log("weather updated");
  return {
    ...weatherData,
    currentWeather: updatedCurrentWeather,
    dailyWeather: updatedDailyWeather,
    hourlyWeather: updatedHourlyWeather,
  };
}
function updateWeatherTimeFormatChanged(weatherData, timeFormat) {
  const { dailyWeather, hourlyWeather } = weatherData;
  const updatedDailyWeather = dailyWeather.map((day) => {
    return {
      ...day,
      //sunRise:function to convert timeFormat,
      //sunSet:function to convert timeFormat
    };
  });
  const updatedHourlyWeather = hourlyWeather.map((hour) => {
    return {
      ...hour,
      temp: hour.time.map((time) => "dummy"), //function to convert time format(timeFormat)),
    };
  });
}
console.log("8 PM"[1]);
function updateWeather(weatherData, configObject, propertyChangedName) {
  const { currentWeather, dailyWeather, hourlyWeather } = weatherData;
  const { degree, timeFormat } = configObject;

  // for (const propName in configObject) {
  //   console.log(propName);
  // }
  switch (propertyChangedName) {
    case "degree":
      return updateWeatherDegreeChanged(weatherData, degree);
    case "timeFormat":
    // updateWeatherTimeFormatChanged(weatherData,timeFormat);
    default:
      break;
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
  fetchWeatherData,
  fetchLocations,
  updateWeather,
  updateStoredFavLocations,
  weatherCodeToIcon,
  externalTooltip,
};
