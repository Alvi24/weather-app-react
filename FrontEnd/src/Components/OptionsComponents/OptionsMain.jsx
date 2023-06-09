import React, { useState, useEffect, useRef, useCallback } from "react";
import OptionsHamburger from "./OptionsHamburger";
import OptionsSidePanel from "./OptionsSidePanel";
import styles from "../../styles/Options.module.css";
export default function Options() {
  const [appear, setAppear] = useState(false);
  const OptionsRef = useRef(null);
  const isElementDragged = useRef(false);
  const updateIsElementDragged = useCallback((isDragged) => {
    isElementDragged.current = isDragged;
  }, []);
  const AppearSwap = useCallback(() => {
    setAppear((prevState) => !prevState);
    document
      .querySelector(`.App > :not(.${styles.Options})`)
      .classList.add("blur");

    if (appear) {
      document
        .querySelector(`.App > :not(.${styles.Options})`)
        .classList.remove("blur");
    }
  }, [appear]);

  useEffect(() => {
    if (!appear) return;

    function effectClick(e) {
      if (!OptionsRef.current.contains(e.target) && !isElementDragged.current) {
        document
          .querySelector(`.App > :not(.${styles.Options})`)
          .classList.remove("blur");
        setAppear(false);
      }
    }
    document.addEventListener("click", effectClick, { capture: true });
    return () => {
      document.removeEventListener("click", effectClick, { capture: true });
    };
  }, [appear]);
  return (
    <div ref={OptionsRef} className={styles.Options}>
      <OptionsHamburger onAppear={AppearSwap} />
      <OptionsSidePanel
        appear={appear}
        setIsElementDragged={updateIsElementDragged}
        isDragging={isElementDragged}
      />
    </div>
  );
}
