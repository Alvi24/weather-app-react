// npm run dev
import Options from "./Components/OptionsComponents/OptionsMain";
import Body from "./Components/Body";
function App() {
  
  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(getData);
  //   function getData(position) {
  //     let { latitude, longitude } = position.coords;
  //     WeatherData(latitude, longitude).then(({ data }) => {
  //       let { current_weather } = data;
  //       let { time } = current_weather;
  //       time = new Date(time * 1000);
  //       console.log(time);
  //       let hours = time.getHours();
  //       var minutes = "0" + time.getMinutes();
  //       var seconds = "0" + time.getSeconds();
  //       console.log(hours + "   " + minutes + "  " + seconds);
  //       console.log(current_weather);
  //     });
  //   }

  //   // console.log("running");
  //   // fetch("http://localhost:5000/")
  //   //   .then((res) => res.json())
  //   //   .then((data) => console.log(data));
  //   // axios
  //   //   .get(
  //   //     "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation,windspeed_10m&timeformat=unixtime&timezone=Europe%2FBerlin"
  //   //   )
  //   //   .then((data) => {
  //   //     console.log(data.data);
  //   //   });
  // }, []);

  return (
    <div className="App">
      <Options />
      <Body />
    </div>
  );
}

export default App;
