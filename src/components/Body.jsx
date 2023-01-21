import React, { Component } from "react";
export default class Body extends Component {
  state = {
    li: [
      { text: "Was firs released in 2013", id: "1" },
      { text: "Was originally created by Jordan Walke", id: "2" },
      { text: "Has well over 100K stars on GitHub", id: "3" },
      { text: "is maintained by Facebook", id: "4" },
      {
        text: "Powes thousands of enterprise apps,including mobile apps",
        id: "5",
      },
    ],
  };
  render() {
    return (
      <>
        <div className="hero">
          <h1 className="White-title">Fun facts about react</h1>
          <ul>
            {this.state.li.map((el) => (
              <li key={el.id}>{el.text}</li>
            ))}
          </ul>
        </div>
      </>
    );
  }
}
