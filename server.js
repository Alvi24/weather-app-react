var express = require("express");
var app = express();

app.get("/", (req, res) => {
  res.send(JSON.stringify("hello"))
});
app.listen("5000", () => {
  console.log("server up and running");
});
