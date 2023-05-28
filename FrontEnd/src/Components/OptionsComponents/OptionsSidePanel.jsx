import React, { useContext } from "react";
import FavLocationsComponent from "./FavLocationsComponent.jsx";
import { configContext } from "../../App.js";
import styles from "../../styles/Options.module.css";

export default function OptionsSidePanel({ appear, setIsElementDragged }) {
  // let activeClassName = useMemo(() => {
  //   return appearHandle ? styles.active : "";
  // }, [appearHandle]);
  //COMPONENT RE-RENDERS WHEN PROPS CHANGE
  const [configObject, setConfigObject] = useContext(configContext);
  const changeDegree = (degree) => {
    const prevDegree = configObject.degree;
    if (degree !== prevDegree)
      setConfigObject((prevState) => ({
        ...prevState,
        degree: degree,
      }));
  };
  const changeTimeFormat = (timeFormat) => {
    const prevTimeFormat = configObject.timeFormat;
    if (timeFormat !== prevTimeFormat)
      setConfigObject((prevState) => ({
        ...prevState,
        timeFormat: timeFormat,
      }));
  };
  return (
    <div className={`${styles.sidePanel} ${appear ? styles.active : ""}`}>
      <section className={styles.configSection}>
        <div className={styles.toggleContainer}>
          <h3 className={styles.degreeTitle}>Degree</h3>
          <div
            className={`${styles.toggle} ${styles.degrees} ${
              configObject.degree === "celsius" ? styles.left : styles.right
            } `} //${styles[configObject.degree]}
          >
            <button
              className={styles.left}
              onClick={() => changeDegree("celsius")}
            >
              <p>°C</p>
            </button>
            <button
              className={styles.right}
              onClick={() => changeDegree("fahrenheit")}
            >
              <p>°F</p>
            </button>

            <div className={styles.switch}></div>
          </div>
        </div>
        <div className={styles.toggleContainer}>
          <h3 className={styles.degreeTitle}>Time format</h3>
          <div
            className={`${styles.toggle} ${styles.degrees} ${
              configObject.timeFormat === "en-GB" ? styles.left : styles.right
            }`}
          >
            <button
              className={styles.left}
              onClick={() => changeTimeFormat("en-GB")}
            >
              <p>24h</p>
            </button>
            <button
              className={styles.right}
              onClick={() => changeTimeFormat("en-US")}
            >
              <p>12h</p>
            </button>

            <div className={styles.switch}></div>
          </div>
        </div>
      </section>
      <FavLocationsComponent setIsElementDragged={setIsElementDragged} />
      <section className={styles.poweredBy}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="bi bi-cloud-sun me-2"
          viewBox="0 0 16 16"
        >
          <path d="M7 8a3.5 3.5 0 0 1 3.5 3.555.5.5 0 0 0 .624.492A1.503 1.503 0 0 1 13 13.5a1.5 1.5 0 0 1-1.5 1.5H3a2 2 0 1 1 .1-3.998.5.5 0 0 0 .51-.375A3.502 3.502 0 0 1 7 8zm4.473 3a4.5 4.5 0 0 0-8.72-.99A3 3 0 0 0 3 16h8.5a2.5 2.5 0 0 0 0-5h-.027z"></path>
          <path d="M10.5 1.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1zm3.743 1.964a.5.5 0 1 0-.707-.707l-.708.707a.5.5 0 0 0 .708.708l.707-.708zm-7.779-.707a.5.5 0 0 0-.707.707l.707.708a.5.5 0 1 0 .708-.708l-.708-.707zm1.734 3.374a2 2 0 1 1 3.296 2.198c.199.281.372.582.516.898a3 3 0 1 0-4.84-3.225c.352.011.696.055 1.028.129zm4.484 4.074c.6.215 1.125.59 1.522 1.072a.5.5 0 0 0 .039-.742l-.707-.707a.5.5 0 0 0-.854.377zM14.5 6.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"></path>
        </svg>
        <p>Powered By Open Meteo</p>
      </section>
    </div>
  );
}
