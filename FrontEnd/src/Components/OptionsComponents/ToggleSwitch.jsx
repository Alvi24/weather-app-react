import React, { useContext } from "react";
import styles from "../../styles/Options.module.css";
import { configContext } from "../../App.js";
export default function ToggleSwitch({
  title,
  configObjectPropertyName,
  leftSide,
  rightSide,
}) {
  const [configObject, setConfigObject] = useContext(configContext);

  const changeConfigObject = (changedConfigObjectPropertyValue) => {
    const prevConfigObject = { ...configObject };
    if (
      prevConfigObject[configObjectPropertyName] !==
      changedConfigObjectPropertyValue
    ) {
      const updatedConfigObject = prevConfigObject;
      updatedConfigObject[configObjectPropertyName] =
        changedConfigObjectPropertyValue;

      setConfigObject(updatedConfigObject);
    }
  };
  return (
    <div className={styles.toggleContainer}>
      <h3 className={styles.degreeTitle}>{title}</h3>
      <div
        className={`${styles.toggle} ${
          configObject[configObjectPropertyName] ===
          leftSide.configObjectPropertyValue
            ? styles.left
            : styles.right
        } `} //${styles[configObject.degree]}
      >
        <button
          className={styles.left}
          onClick={() => changeConfigObject(leftSide.configObjectPropertyValue)}
        >
          {leftSide.text}
        </button>
        <button
          className={styles.right}
          onClick={() =>
            changeConfigObject(rightSide.configObjectPropertyValue)
          }
        >
          {rightSide.text}
        </button>

        <div className={styles.switch}></div>
      </div>
    </div>
  );
}
