import React, { useContext, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { favoriteLocationsContext } from "../../App";
import { weatherCodeToIcon } from "../../Utilities.mjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faPenToSquare,
  faClock,
  faLocationDot,
  faGripLines,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/Options.module.css";
import useDraggableInPortal from "../useDraggableInPortal";
import PopUp from "./PopUp";
import Time from "../Time";

const MemoizedPopUp = React.memo(PopUp, ontransitionend);
const MemoizedTime = React.memo(Time);

export default function FavLocationsComponent({ changeIsElementDragged }) {
  const [isDragDisabled, setIsDragDisabled] = useState(true);
  const [popUp, setPopUp] = useState();
  const renderDraggable = useDraggableInPortal();
  const {
    favLocationsUseState: [favoriteLocations, setFavoriteLocations],
    onFavLocationClickAddToFavWeather,
    onFavLocationClickAddFavLocationData,
  } = useContext(favoriteLocationsContext);

  console.log("fav render");

  function Reorder(result) {
    changeIsElementDragged(false);
    if (!result.destination) return;
    const reorderedElements = [...favoriteLocations];
    const [movedElement] = reorderedElements.splice(result.source.index, 1);
    reorderedElements.splice(result.destination.index, 0, movedElement);
    setFavoriteLocations(reorderedElements);
  }

  const handleAddButtonClick = () => {
    if (favoriteLocations.length >= 5 && !popUp) {
      setPopUp({ text: "Favorite locations limit reached" });
      return;
    }
    if (!popUp && onFavLocationClickAddToFavWeather() === "duplicate found")
      setPopUp({ text: "Location is already in favorites" });
  };

  const handleEditButtonClick = () => {
    if (favoriteLocations.length === 0) return;
    const favLocationContainer = document.querySelector(
      `.${styles.favLocationContainer}`
    );
    setIsDragDisabled(!isDragDisabled);
    if (favLocationContainer.classList.contains(styles.edit))
      favLocationContainer.classList.remove(styles.edit);
    else favLocationContainer.classList.add(styles.edit);
  };
  const handleDeleteButtonClick = (index) => {
    console.log("remove button", index);

    const favLocationContainer = document.querySelector(
      `.${styles.favLocationContainer}`
    );

    if (
      favoriteLocations.length === 1 &&
      favLocationContainer.classList.contains(styles.edit)
    ) {
      favLocationContainer.classList.remove(styles.edit);
      setIsDragDisabled(true);
    }
    const cloneFavLocations = [...favoriteLocations];
    cloneFavLocations.splice(index, 1);
    return favoriteLocations.length > 0
      ? setFavoriteLocations([...cloneFavLocations])
      : null;
  };
  return (
    <section className={styles.favLocationsSection}>
      <h3 className={styles.favoriteLocationsTitle}>Favorite locations</h3>
      <div className={styles.addFavLocationText}>
        Add current location to favorites{" "}
        <div className={styles.AddIconAndPopUp}>
          {popUp ? (
            <MemoizedPopUp
              popUpText={popUp.text}
              removePopUp={() => setPopUp(null)}
            />
          ) : null}
          <FontAwesomeIcon
            className={styles.addIcon}
            icon={faPlus}
            onClick={handleAddButtonClick}
          />
        </div>
      </div>
      <p className={styles.editFavLocationText}>
        Edit{" "}
        <FontAwesomeIcon
          className={styles.editIcon}
          onClick={handleEditButtonClick}
          icon={faPenToSquare}
        />
      </p>
      <DragDropContext onDragEnd={Reorder} enableDefaultSensors>
        <Droppable droppableId="favLocations">
          {(provided, snapshot) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              //   style={{ background: "red" }}
              className={styles.favLocationContainer}
            >
              {favoriteLocations.length > 0 &&
                favoriteLocations.map((favoriteLocation, index) => {
                  let key =
                    favoriteLocation.locationName +
                    favoriteLocation.currentWeather.temperature +
                    favoriteLocation.currentWeather.weatherCode;

                  return (
                    <Draggable
                      key={key}
                      draggableId={key}
                      index={index}
                      isDragDisabled={isDragDisabled}
                    >
                      {renderDraggable((provided, snapshot) => (
                        <li
                          className={`${styles.favLocation} ${
                            snapshot.isDragging ? styles.isDragged : ""
                          }`}
                          key={
                            favoriteLocation.locationName +
                            favoriteLocation.currentWeather.temperature +
                            favoriteLocation.currentWeather.weatherCode
                          }
                          onClick={() => {
                            setPopUp(null);
                            onFavLocationClickAddFavLocationData(
                              favoriteLocation
                            );
                          }}
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
                                {favoriteLocation.currentWeather.temperature}°
                              </p>
                              <div className={styles.favWeatherHighLow}>
                                H:{favoriteLocation.dailyWeather[0].maxTemp}° L:
                                {favoriteLocation.dailyWeather[0].minTemp}°
                              </div>
                              <div className={styles.verticalLine}></div>
                            </div>
                            <div className={styles.favLocationAndTime}>
                              <p>
                                <FontAwesomeIcon icon={faClock} />{" "}
                                <MemoizedTime
                                  timeZone={favoriteLocation.timeZone}
                                />
                              </p>
                              <p>
                                <FontAwesomeIcon icon={faLocationDot} />{" "}
                                {favoriteLocation.locationName}{" "}
                              </p>
                            </div>
                          </div>
                          <div
                            className={styles.sortButton}
                            onMouseDown={() => changeIsElementDragged(true)}
                            onClick={(e) => e.stopPropagation()} //not update weather when sortButton is clicked
                            {...provided.dragHandleProps} //custom handler
                          >
                            <FontAwesomeIcon icon={faGripLines} />
                          </div>
                          <FontAwesomeIcon
                            icon={weatherCodeToIcon(
                              favoriteLocation.currentWeather.weatherCode
                            )}
                            className={styles["favWeatherIcon"]}
                          />

                          {/* <p>mintemp: {dailyWeather[0].minTemp + "°"} </p> */}
                          <FontAwesomeIcon
                            className={styles.deleteButton}
                            icon={faTrash}
                            // style={
                            //   !isDragDisabled ? { translate: "105%" } : null
                            // }
                            onClickCapture={() =>
                              handleDeleteButtonClick(index)
                            }
                          />
                        </li>
                      ))}
                    </Draggable>
                  );
                })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
}
