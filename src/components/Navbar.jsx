import React, { Component } from "react";

export default class NavBar extends Component {

  render() {
    return (
      <nav className="NavBar">
        <p className="ReactFacts"> <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/50px-React-icon.svg.png"
          alt="react-icon not loaded"
        /> ReactFacts</p>
        <p>React Course - Project 1</p>
      </nav>
    );
  }
}
