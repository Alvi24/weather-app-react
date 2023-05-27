import { useEffect, useMemo, useState } from "react";

export default function Time({
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone, //user (default) timezone
}) {
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
    return new Intl.DateTimeFormat("en-GB", options).format(time);
  }, [time, timeZone]);
  return <>{formattedTime}</>;
}
