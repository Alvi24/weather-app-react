import React from "react";

import useCurrentTime from "../../CustomHooks/useCurrentTime";
import { weatherCodeToIcon } from "../../Utilities.mjs";
import useDraggableInPortal from "../../CustomHooks/useDraggableInPortal";

import {
  faTrash,
  faClock,
  faLocationDot,
  faGripLines,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/Options.module.css";
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FavLocation({
  id,
  index,
  favoriteLocationData,
  isDragDisabled,
  onDeleteButtonClick,
  onFavoriteLocationClick,
  onSortButtonMouseDown,
}) {
  const currentTime = useCurrentTime(favoriteLocationData.timeZone);
  const renderDraggable = useDraggableInPortal();
  console.log("favLocation render");
  return (
    <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
      {renderDraggable((provided, snapshot) => (
        <li
          className={`${styles.favLocation} ${
            snapshot.isDragging ? styles.isDragged : ""
          }`}
          key={id}
          onClick={onFavoriteLocationClick}
          ref={provided.innerRef}
          {...provided.draggableProps}
          // {...provided.dragHandleProps} add the handler to element itself
          // style={{
          //   ...provided.draggableProps.style,
          //   left: snapshot.isDragging ? "" : null,
          //   top: snapshot.isDragging ? "" : null,
          // }}
        >
          <div className={styles.mainWeatherInfo}>
            <div className={styles.favWeatherTemp}>
              <p className={styles.current}>
                {favoriteLocationData.currentWeather.temperature}°
              </p>
              <div className={styles.favWeatherHighLow}>
                H:{favoriteLocationData.dailyWeather[0].maxTemp}° L:
                {favoriteLocationData.dailyWeather[0].minTemp}°
              </div>
              <div className={styles.verticalLine}></div>
            </div>
            <div className={styles.favLocationAndTime}>
              <p>
                <FontAwesomeIcon icon={faClock} /> {currentTime}
              </p>
              <p>
                <FontAwesomeIcon icon={faLocationDot} />{" "}
                {favoriteLocationData.locationName}{" "}
              </p>
            </div>
          </div>
          <button
            className={styles.sortButton}
            onMouseDown={onSortButtonMouseDown}
            onClick={(e) => e.stopPropagation()} //not update weather when sortButton is clicked
            disabled={isDragDisabled}
            {...provided.dragHandleProps} //custom handler
          >
            <FontAwesomeIcon icon={faGripLines} />
          </button>
          <FontAwesomeIcon
            icon={weatherCodeToIcon(
              favoriteLocationData.currentWeather.weatherCode
            )}
            className={styles["favWeatherIcon"]}
          />

          {/* <p>mintemp: {dailyWeather[0].minTemp + "°"} </p> */}
          <button
            className={styles.deleteButton}
            onClickCapture={() => onDeleteButtonClick(favoriteLocationData)}
            disabled={isDragDisabled}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </li>
      ))}
    </Draggable>
  );
}
