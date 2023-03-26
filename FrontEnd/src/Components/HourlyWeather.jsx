import React from "react";

export default function HourlyWeather({ hourlyWeather }) {
  console.log(hourlyWeather);
  return <div>{hourlyWeather.day} {hourlyWeather.date}</div>;
}
