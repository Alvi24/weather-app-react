// npm run dev
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false })); //use this if you want to use data that comes from a Form(input)
app.use(express.json()); //use this if you want to use data that comes as JSON or use both

const cors = require("cors");
const { resolveObjectURL } = require("buffer");
const { endianness } = require("os");
const { rejects } = require("assert");
const corsOptions = {
  //use corsOptions an app.use(cors to fix the cost error)
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use this after the variable declaration
app.post("/", (req, res) => {
  console.log(req.body);
  getLatAndLong(req.body.input)
    .then((coords) => {
      //req.body.searchText
      // the song_iframe is the returned value from Scraper
      res.send(JSON.stringify(coords));
    })
    .catch((error) => {
      res
        .status("400")
        .send(new Error("No location found with this input text"));
      console.log("error");
    });
});

let browser, page;
async function getLatAndLong(searchText) {
  const puppeteer = require("puppeteer");
  if (!browser) {
    browser = await puppeteer.launch(
      //remove (the headless,defaultViewport and the curly brackets)property if you want the chromium page to not open
      {
        headless: false, //to make the browser headless
        defaultViewport: false, // not use the default but
      }
    );
    page = await browser.newPage();
    await page.goto(
      `https://www.meteoblue.com/en/weather/week/elbasan_albania_783263/`
    );
    await page.click("input[type='submit']");
    await page.waitForSelector("input#gls");
    await page.click("input#gls");
  }
  if (searchText == undefined) {
    return;
  }

  await page.$eval(
    "input#gls",
    (el, searchText) => {
      el.value = searchText; //does't work this way use page.type instead
    },
    searchText
  );
  try {
    await page.waitForSelector(".search-results:not(.multiple,.lastvis-only)", {
      timeout: 1000,
    });

    await page.waitForTimeout(500);
    const locationNames = await page.$$eval("tr.loc", (locations) => {
      let array = locations.map((location) => {
        return {
          locationName: location.querySelector(".locationname-inside")
            .innerHTML,
          latitude: location.querySelector("td.lat").innerHTML,
          longitude: location.querySelector("td.lon").innerHTML,
          countryFlag: location.querySelector("img").src,
          region: location.querySelector("td.admin1").innerHTML,
        };
      });
      return array;
    });
    console.log(locationNames);
    console.log(locationNames.length);
    if (locationNames.length === 0) {
      return Promise.reject();
    }
    return locationNames;
  } catch (err) {
    console.log("rejectiong");
    return Promise.reject(err);
  }

}
getLatAndLong();
app.listen("5000", () => {
  console.log("server up and running");
});
