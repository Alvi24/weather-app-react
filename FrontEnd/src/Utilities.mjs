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
          timezone: "Europe/Berlin",
        },
      }
    )
    .then(async ({ data }) => {
      return {
        locationName:
          locationNameFromSearchedLocation ??
          (await getLocationNameAndTimeZone(latitude, longitude)),
        coords: {
          lat: latitude,
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
    weatherCode: Math.round(current_weather.weathercode / 10) * 10,
    temperature: Math.round(current_weather.temperature),
    windSpeed: Math.round(current_weather.windspeed),
    windDirection: current_weather.winddirection,
  };
}
function convertUnixTimeToNormalTime(arrayOfUnixTime, timeFormat) {
  const options = { hour: "numeric" };
  return arrayOfUnixTime.map((time) =>
    Intl.DateTimeFormat(timeFormat, options).format(time * 1000)
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

  const dayOfWeekLength = Object.keys(dayOfWeek).length;
  let days = [];
  for (let i = 0; i < dayOfWeekLength; ++i) {
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
  let hourlyDataClone = [];
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
    hourlyDataClone[hourlyIterator].time = timeHourly.slice(i - 24, i);
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
  if (e.target.value.length < 2) {
    return;
  }
  const { value: input } = e.target;
  return axios
    .post(process.env.REACT_APP_SERVER_URL, {
      input,
    })
    .then((res) => res.data)
    .catch((error) => {
      console.log(error.response);
      return Promise.reject("No location found");
    });
}
function convertTemperature(temp, degree) {
  return degree === "celsius"
    ? Math.round(((temp - 32) * 5) / 9)
    : Math.round((temp * 9) / 5 + 32);
}
function convertTime(time, timeFormat) {
  let hour = timeFormat === "en-GB" ? +time.slice(0, time.indexOf(" ")) : +time;
  switch (timeFormat) {
    case "en-GB":
      if (time.slice(-2) === "PM" && hour < 12) hour += 12;
      else if (time.slice(-2) === "AM" && hour < 10) hour = `0${hour}`;
      if (time === "12 AM") hour = "00";
      return hour;
    case "en-US":
      let timePeriod = "AM";
      if (hour === 0) return "12 AM";
      if (hour >= 12) timePeriod = "PM";
      return `${hour > 12 ? hour - 12 : hour}  ${timePeriod}`;
    default:
      break;
  }
}

async function updateStoredFavLocations(savedFavLocations, configObject) {
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
      return "fa-cloud-sun-rain";
    case 70:
      return "fa-snowflake";
    case 80:
      return "fa-cloud-rain";
    default:
      return "fa-sun";
  }
}
function updateWeatherDegreeChanged(weatherData, degree) {
  const { currentWeather, dailyWeather, hourlyWeather } = weatherData;

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
      sunRise: convertTime(day.sunRise, timeFormat),
      sunSet: convertTime(day.sunSet, timeFormat),
    };
  });
  const updatedHourlyWeather = hourlyWeather.map((hour) => {
    return {
      ...hour,
      time: hour.time.map((time) => convertTime(time, timeFormat)),
    };
  });
  return {
    ...weatherData,
    dailyWeather: updatedDailyWeather,
    hourlyWeather: updatedHourlyWeather,
  };
}

function updateWeather(weatherData, configObject, propertyChangedName) {
  const { degree, timeFormat } = configObject;
  console.log("weatherUpdated");
  switch (propertyChangedName) {
    case "degree":
      return updateWeatherDegreeChanged(weatherData, degree);
    case "timeFormat":
      return updateWeatherTimeFormatChanged(weatherData, timeFormat);
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

    tooltipEl.querySelector(".tooltipTime").innerHTML = time + "<br>";
    tooltipEl.querySelector(".tooltipWeather").innerHTML =
      weather.temp + `° <i class="fa ${weather.weathercode}"></i>`;
  }
}

function isUserOnMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export {
  fetchWeatherData,
  fetchLocations,
  updateWeather,
  updateStoredFavLocations,
  weatherCodeToIcon,
  externalTooltip,
  isUserOnMobile,
};
