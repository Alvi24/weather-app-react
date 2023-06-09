import { useContext, useEffect, useMemo, useState } from "react";
import { configContext } from "../App";

export default function useCurrentTime(
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone //user (default) timezone
) {
  const [configObject] = useContext(configContext);
  // console.log(configObject.timeFormat);
  const [time, setTime] = useState(new Date());
  console.log("TIME RENDER");
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      if (currentTime.getMinutes() !== time.getMinutes()) {
        setTime(currentTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);
  // useEffect(() => {
  //   const currentTime = new Date();
  //   setTime(currentTime);
  // }, [configObject.timeFormat]);
  const formattedTime = useMemo(() => {
    const options = {
      hour: "numeric",
      minute: "numeric",
      timeZone: timeZone,
    };
    return new Intl.DateTimeFormat(configObject.timeFormat, options).format(
      time
    ); //"en-GB"
  }, [time, timeZone, configObject.timeFormat]);

  return formattedTime;
}
