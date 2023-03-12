import React from "react";
import styles from "../../styles/Options.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
export default function OptionsHamburger(props) {
  function handleKeyDown(event) {
    console.log(event.key);
    if (event.key === "Tab") {
      // Handle the keyboard event
      props.onAppear();
    }
  }
  return (
    <FontAwesomeIcon
      icon={faBars}
      className={styles.optionsHamburger}
      onClick={props.onAppear}
      onKeyDown={handleKeyDown} //when clicking with keyboard
      onKeyUp={handleKeyDown} //when clicking with keyboard
      tabIndex="0" //to style when clicked with keyboard (Ta)
    />
  );
}
