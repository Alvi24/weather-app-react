var express = require("express");
var app = express();
app.use(express.urlencoded({ extended: false })); //use this if you want to use data that comes from a Form(input)
app.use(express.json()); //use this if you want to use data that comes as JSON or use both

const cors = require("cors");
const { resolveObjectURL } = require("buffer");
const { endianness } = require("os");
const corsOptions = {
  //use corsOptions an app.use(cors to fix the cost error)
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use this after the variable declaration
app.get("/", (req, res) => {
  getLatAndLong("be").then((coords) => {
    //req.body.searchText
    // the song_iframe is the returned value from Scraper
    res.send(JSON.stringify(coords));
  });
  // res.send("hello page");
});

getLatAndLong("be");
async function getLatAndLong(searchText) {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: false, //to make the browser headless
    defaultViewport: false, // not use the default but
  });
  const page = await browser.newPage();
  await page.goto(
    `https://www.meteoblue.com/en/weather/week/elbasan_albania_783263/`
  );

  await page.click("input[type='submit']");
  // await page.waitForNavigation({ waitUntil: "networkidle2" });

  // await page.$eval("input#gls", (el) => {
  //   el.value = "berlin";   //does't work this way use page.type instead
  // });
  // await page.click("button#gls_map");
  await page.waitForSelector("#gls_map");
  await page.click("#gls_map");
  await page.type("input#gls", "berlin");
  // const a = await page.$eval(".locationname-inside", (el) => el.innerHTML);
  // console.log(a);
  const locationNames = await page.$$eval("tr.loc", (locations) => {
    let array = locations.map((location) => {
      return {
        cityName: location.querySelector(".locationname-inside").innerHTML,
        latitude: location.querySelector("td.lat").innerHTML,
        longitude: location.querySelector("td.lon").innerHTML,
      };
    });
    return array;
  });
  console.log(locationNames);
  // const locationNames = await page.$$eval("tr.loc", (locations) => {
  //   page.waitForNavigation();
  //   locations.map((location) => {
  //     return document.querySelector("div.locationname-inside").innerHTML;
  //   });
  // });
  // console.log(locationNames);
  // return {
  //   latitude: 20,
  //   longitude: 30,
  // };
}
app.listen("5000", () => {
  console.log("server up and running");
});
