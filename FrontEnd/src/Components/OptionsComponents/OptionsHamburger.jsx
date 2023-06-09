import React from "react";
import styles from "../../styles/Options.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
export default function OptionsHamburger(props) {
  function handleKeyDown(event) {
    console.log(event.key);
    if (event.key === "Tab") {
      props.onAppear();
    }
  }
  return (
    <FontAwesomeIcon
      icon={faBars}
      className={styles.optionsHamburger}
      onClick={props.onAppear}
      onKeyDown={handleKeyDown} 
      onKeyUp={handleKeyDown}
      tabIndex="0"
    />
  );
}
