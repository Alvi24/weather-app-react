require("dotenv").config();

const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
console.log(process.env.PORT);
const cors = require("cors");
const { resolveObjectURL } = require("buffer");
const { endianness } = require("os");
const { rejects } = require("assert");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.post("/", (req, res) => {
  console.log("req", req.body);
  getLocations
    .then((returnedFunction) => returnedFunction(req.body.input))
    .then((fetchedLocations) => res.json(fetchedLocations))
    .catch((errorMessage) => {
      res.status(400).send(new Error("No location found with this input text"));
      console.log(errorMessage);
    });
});

app.post("/big-data-api", (req, res) => {
  const { lat, long } = req.body;
  getLocationNameAndTimeZone(lat, long).then((data) => res.json(data));
});

const getLocations = (async function () {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
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

      await new Promise((r) => setTimeout(r, 500));

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
})();

async function getLocationNameAndTimeZone(lat, long) {
  return axios
    .get(
      `https://api.bigdatacloud.net/data/reverse-geocode?localityLanguage=en&key=${process.env.API_KEY_BIG_DATA}`,
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
        location: data.city,
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

app.listen(process.env.PORT, () => {
  console.log(`server up and running at port ${process.env.PORT}`);
});
