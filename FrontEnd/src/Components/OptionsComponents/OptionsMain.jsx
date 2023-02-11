import React, { useState, useEffect } from "react";
import styles from "../../styles/Options.module.css";
import OptionsHamburger from "./OptionsHamburger";
import OptionsSidePanel from "./OptionsSidePanel";
export default function Options(props) {
  const [appear, setAppear] = useState(() => false);
  function AppearSwap() {
    // setAppear(appear === false ? true : false);
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
    function effectClick(e) {
      if (
        !document.querySelector(`.${styles.Options}`).contains(e.target) &&
        appear
      ) {
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
    <div className={styles.Options}>
      <OptionsHamburger onAppear={AppearSwap} />
      {/*or ()=> setAppear(appear === false ? true : false) }  */}
      <OptionsSidePanel appearHandle={appear} />
    </div>
  );
}
