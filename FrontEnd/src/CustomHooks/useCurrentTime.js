import { useContext, useEffect, useMemo, useState } from "react";
import { configContext } from "../App";

export default function useCurrentTime(
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone //user (default) timezone
) {
  const [configObject] = useContext(configContext);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      if (currentTime.getMinutes() !== time.getMinutes()) {
        setTime(currentTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  const formattedTime = useMemo(() => {
    const options = {
      hour: "numeric",
      minute: "numeric",
      timeZone: timeZone,
    };
    return new Intl.DateTimeFormat(configObject.timeFormat, options).format(
      time
    ); 
  }, [time, timeZone, configObject.timeFormat]);

  return formattedTime;
}
