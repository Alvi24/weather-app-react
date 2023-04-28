import React, { useState, useEffect, useRef } from "react";
import OptionsHamburger from "./OptionsHamburger";
import OptionsSidePanel from "./OptionsSidePanel";
import styles from "../../styles/Options.module.css";
export default function Options() {
  const [appear, setAppear] = useState(false);
  const OptionsRef = useRef(null);
  function AppearSwap() {
    setAppear(!appear);
    document
      .querySelector(`.App > :not(.${styles.Options})`)
      .classList.add("blur");
    // document.querySelector(`.App > :not(.${styles.Options})`).style.filter =`blur(${matchMedia("(max-width:800px)").matches?"10px":"2px"})`;
    if (appear) {
      // document.querySelector(`.App > :not(.${styles.Options})`).style.removeProperty("filter"); //for small screens
      document
        .querySelector(`.App > :not(.${styles.Options})`)
        .classList.remove("blur");
    }
  }

  useEffect(() => {
    if (!appear) return;
    function effectClick(e) {
      if (!OptionsRef.current.contains(e.target)) {
        console.log(e.target.nodeName);
        document
          .querySelector(`.App > :not(.${styles.Options})`)
          .classList.remove("blur");
        setAppear(false);
      }
    }
    document.addEventListener("click", effectClick);
    return () => {
      console.log("event listener removed");
      document.removeEventListener("click", effectClick);
    };
  });
  return (
    <div ref={OptionsRef} className={styles.Options}>
      <OptionsHamburger onAppear={AppearSwap} />
      <OptionsSidePanel appearHandle={appear} />
    </div>
  );
}
