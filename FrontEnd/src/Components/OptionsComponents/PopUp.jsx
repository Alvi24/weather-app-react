import React, { useEffect, useRef } from "react";
import styles from "../../styles/Options.module.css";
export default function PopUp({ popUpText, removePopUp }) {
  const PopUpRef = useRef();
  const firstTransition = useRef(true);
  useEffect(() => {
    const timer1 = setTimeout(() => {
      PopUpRef.current?.classList.add(styles.show);
    }, 1);

    const timer2 = setTimeout(() => {
      PopUpRef.current.classList.remove(styles.show);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  const handleOnTransitionEnd = () => {
    if (firstTransition.current) {
      firstTransition.current = false;
      return;
    }
    removePopUp();
  };
  return (
    <p
      className={styles.popUp}
      ref={PopUpRef}
      onTransitionEnd={handleOnTransitionEnd}
    >
      {popUpText}
    </p>
  );
}
