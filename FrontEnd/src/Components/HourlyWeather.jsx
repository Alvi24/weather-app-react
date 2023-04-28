import React, { useMemo, useContext, useEffect, useRef } from "react";
import { MyContext } from "./Body";
import { configContext } from "../App";
import {
  convertCelsiusToFahrenheit,
  weatherCodeToIcon,
  externalTooltip as costumTooltip,
} from "../API.mjs";
import styles from "../styles/HourlyWeather.module.css";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function HourlyWeather({
  hourlyWeather,
  visible,
  removeVisible,
}) {
  const mobileView = useContext(MyContext);
  const { configObject } = useContext(configContext);
  console.log(configObject); // value from App.js
  let prevHourlyWeather = useRef(null);
  console.log("hello");
  useEffect(() => {
    if (!mobileView) return;
    function handleClick(e) {
      if (
        !document.querySelector(`.${styles.HourlyContainer}`).contains(e.target)
      ) {
        if (prevHourlyWeather.current !== hourlyWeather) {
          console.log(e.target.nodeName);
          prevHourlyWeather.current = hourlyWeather;
        } else {
          prevHourlyWeather.current = {};
          removeVisible();
        }
      }
    }
    document.addEventListener("click", visible ? handleClick : null);
    return () => {
      console.log("event listener removed Hourly");
      document.removeEventListener("click", handleClick);
    };
  }, [hourlyWeather, mobileView, visible, removeVisible]);

  const chartConfig = useMemo(() => {
    return {
      chartData: {
        labels: hourlyWeather.time,
        datasets: [
          {
            data:
              configObject.degree === "celsius"
                ? hourlyWeather.temp
                : hourlyWeather.temp.map((temp) =>
                    convertCelsiusToFahrenheit(temp)
                  ),
            label: ``,
            fill: false,
            borderColor:"grey",
            lineTension: 0.2,
          },
        ],
      },
      chartOptions: {
        plugins: {
          legend: {
            display: false, // remove dataset label rectangle
          },
          tooltip: {
            // interaction: {
            //   mode: "nearest",
            //   axis: "x",
            //   intersect: false,
            // },
            enabled: false,
            external: costumTooltip,
            callbacks: {
              title: function (chart) {
                return hourlyWeather.time[chart[0].dataIndex];
              },
              label: function (context) {
                return {
                  temp:
                    configObject.degree === "celsius"
                      ? hourlyWeather.temp[context.dataIndex]
                      : convertCelsiusToFahrenheit(
                          hourlyWeather.temp[context.dataIndex]
                        ),
                  weathercode: weatherCodeToIcon(
                    hourlyWeather.weathercode[context.dataIndex]
                  ),
                };
              },
            },
          },
        },
        title: {
          display: true,
        },
        legend: {
          display: false,

          labels: {
            boxWidth: 0,
          },
        },
        scales: {
          x: {
            type: "category",
            title: {
              display: !mobileView,
              text: "Hours",
            },
          },
          y: {
            beginAtZero: false,
            title: {
              display: !mobileView,
              text: "Temperature",
            },
            ticks: {
              callback: (value) => {
                return value + "°";
              },
            },
          },
        },
        maintainAspectRatio: false, // set to false to make the chart responsive
        responsive: true, // set to true to make the chart responsive
        // animation: false, // set animation to false to achieve a smoother animation
      },
    };
  }, [hourlyWeather, mobileView, configObject]);
  return (
    <div
      className={`${styles["HourlyContainer"]}  ${
        visible && mobileView
          ? `HourlyContainerGlobal ${styles["visible"]}`
          : ""
      }`}
    >
      <header style={{ textAlign: "center" }}>
        Hourly Weather (
        {hourlyWeather.day === "Today"
          ? hourlyWeather.day
          : hourlyWeather.day + " " + hourlyWeather.date}
        )
      </header>

      <Line
        className={styles["chart"]}
        data={chartConfig.chartData}
        options={chartConfig.chartOptions}
      />
    </div>
  );
}
