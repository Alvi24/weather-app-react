// npm run dev
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.urlencoded({ extended: false })); //use this if you want to use data that comes from a Form(input)
app.use(express.json()); //use this if you want to use data that comes as JSON or use both
console.log(process.env.PORT);
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
  console.log("req", req.body);
  getLocations
    .then((returnedFunction) => returnedFunction(req.body.input))
    .then((fetchedLocations) => res.json(fetchedLocations)) //req.body.searchText  alternate form res.send(JSON.stringify(fetchedLocations))
    .catch((errorMessage) => {
      res.status(400).send(new Error("No location found with this input text"));
      console.log(errorMessage);
    });
});

app.post("/big-data-api", (req, res) => {
  const { lat, long } = req.body;
  getLocationNameAndTimeZone(lat, long).then((data) =>
    // res.send(JSON.stringify(data))
    res.json(data)
  );
});

const getLocations = (async function () {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch(
    //remove (the headless,defaultViewport and the curly brackets)property if you want the chromium page to not open
    {
      headless: false, //to make the browser headless
      defaultViewport: false, // not use the default but
    }
  );
  const page = await browser.newPage();
  await page.goto(
    `https://www.meteoblue.com/en/weather/week/elbasan_albania_783263/`
  );
  await page.click("input[type='submit']");
  await page.waitForSelector("input#gls");
  await page.click("input#gls");

  return async function (searchText) {
    if (!searchText) return;
    try {
      console.log("text", searchText);
      await page.$eval(
        "input#gls",
        (el, searchText) => {
          el.value = searchText;
        },
        searchText
      );
      await page.waitForSelector(
        ".search-results:not(.multiple,.lastvis-only)",
        {
          timeout: 1000,
        }
      );
      // try {
      //   const prevSearch = await page.$eval(
      //     ".search-results",
      //     (el) => el?.textContent
      //   );

      //   await page.waitForFunction(
      //     //wait for search-results to change after typing
      //     (prevSearch) => {
      //       const locationsSearch =
      //         document.querySelector(".search-results").textContent;
      //       return locationsSearch !== prevSearch;
      //     },
      //     { timeout: 500 },
      //     prevSearch
      //   );
      // } catch {}

      // await page.waitForTimeout(500); deprecated version
      await new Promise((r) => setTimeout(r, 500)); // allow the search results to be updated

      const locationNames = await page.$$eval("tr.loc", (locations) => {
        let array = locations.map((location) => {
          return {
            locationName: location.querySelector(".locationname-inside")
              .innerHTML,
            latitude: +location.querySelector("td.lat").innerHTML,
            longitude: +location.querySelector("td.lon").innerHTML,
            countryFlag: location.querySelector("img").src,
            region: location.querySelector("td.admin1").innerHTML,
          };
        });
        return array;
      });

      console.log("locations length", locationNames.length);
      locationNames.forEach((el, index) => console.log(index, el.locationName));

      if (locationNames.length === 0) throw new Error("no location found");

      return {
        weatherData: await bigDataLocationName(locationNames),
        prevSearchText: searchText,
      };
    } catch (err) {
      console.log("rejectiong");
      console.log(err.message);
      return Promise.reject(err.message);
    }
  };
})(); // self invoke the function to open the chromium an weather page

async function getLocationNameAndTimeZone(lat, long) {
  return axios
    .get(
      `https://api.bigdatacloud.net/data/reverse-geocode?localityLanguage=en&key=${process.env.API_KEY_BIG_DATA}`, //server-side big data
      {
        params: {
          latitude: lat,
          longitude: long,
        },
      }
    )
    .then(({ data }) => {
      let timezone;
      data.localityInfo.informative.map((dataSet) => {
        if (dataSet.description === "time zone") timezone = dataSet.name;
      });
      return {
        location: data.city, // .city not .location
        region: data.principalSubdivision,
        timezone,
      };
    });
}
async function bigDataLocationName(data) {
  const promises = [];
  let cloneLocations = [...data];
  cloneLocations.forEach((location, index) => {
    promises.push(
      getLocationNameAndTimeZone(location.latitude, location.longitude).then(
        ({
          location: locationFromBigData,
          region: regionFromBigData,
          timezone: timezoneFromBigData,
        }) => {
          cloneLocations[index].locationName =
            locationFromBigData || cloneLocations[index].locationName;
          cloneLocations[index].region =
            regionFromBigData || cloneLocations[index].region;
          cloneLocations[index].timezone =
            timezoneFromBigData || cloneLocations[index].timezone;
        }
      )
    );
  });

  return Promise.all(promises).then(() => {
    // data.sort((a, b) => {  //sort an array of objects
    //   if (a.locationName < b.locationName) {
    //     return -1;
    //   }
    //   if (a.locationName > b.locationName) {
    //     return 1;
    //   }
    //   return 0;
    // });
    console.log("final", filterDuplicateLocations(cloneLocations));
    return filterDuplicateLocations(cloneLocations);
  });
}

function filterDuplicateLocations(arrayOfLocations) {
  return arrayOfLocations.filter(
    (location, index, self) =>
      index ===
      self.findIndex(
        (cloneLocationElement) =>
          cloneLocationElement.locationName === location.locationName &&
          cloneLocationElement.region === location.region
      )
  );
}
//getLocations(); // opening the chromium (first time)

// const API_KEY = process.env.API_KEY_BIG_DATA;
// const URL = process.env.URL;
// app.get("/environment-variables", (req, res) => {
//   res.send({
//     API_KEY,
//     URL,
//   });
// });
app.listen(process.env.PORT, () => {
  console.log(`server up and running at port ${process.env.PORT}`);
});
