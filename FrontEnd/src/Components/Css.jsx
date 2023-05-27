import React from 'react';
import { CSSTransition } from 'react-transition-group';
import './fade.css'; // CSS file containing the transition styles

function FadeIn({ children }) {
  const duration = 300; // duration of the transition in milliseconds

  return (
    <CSSTransition
      in={true} // whether the component should be visible or not
      timeout={duration}
      classNames="fade"
      unmountOnExit // removes the component from the DOM after the transition has finished
    >
      {children}
    </CSSTransition>
  );
}

export default FadeIn;
