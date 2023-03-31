import React, { useMemo, useState } from "react";
import styles from "../styles/HourlyWeather.module.css";
import anychart from "anychart";
import AnyChart from "anychart-react";
export default function HourlyWeather({ hourlyWeather }) {
  const [chartEnabled, setChartEnabled] = useState(false);
  const tooltipSettings = {
    background: {
      fill: "red",
    },
  };

  console.log(hourlyWeather);
  const hourlyDataMemo = useMemo(() => {
    const { temp, time } = hourlyWeather;
    const hourlyDataClone = [];
    let hours = 24;
    for (let index = 0; index < hours; index++) {
      hourlyDataClone[index] = [time[index], temp[index]];
    }
    return hourlyDataClone;
  }, [hourlyWeather]);
  return (
    <div
      className={`${styles["HourlyContainer"]} HourlyContainerGlobal`}
      id="my-chart"
    >
      <AnyChart
        type="line"
        id="hello"
        data={hourlyDataMemo}
        title={`Hourly Weather (${
          hourlyWeather.day + " " + hourlyWeather.date
        })`}
        yAxis={{ title: "Temp." }}
        xAxis={{ title: "Hours" }}
        tooltip={tooltipSettings}
      />
    </div>
  );
}
