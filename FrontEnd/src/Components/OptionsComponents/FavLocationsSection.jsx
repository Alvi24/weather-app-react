import React, { useContext, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { favoriteLocationsContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/Options.module.css";
import PopUp from "./PopUp";
import FavLocation from "./FavLocation";

const MemoizedPopUp = React.memo(PopUp);
export default function FavLocationsSection({ setIsElementDragged }) {
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [popUp, setPopUp] = useState();
  const {
    favLocationsUseState: [favoriteLocations, setFavoriteLocations],
    onFavLocationClickAddToFavWeather,
    onFavLocationClickAddFavLocationData,
  } = useContext(favoriteLocationsContext);

  function Reorder(result) {
    setIsElementDragged(false);
    if (!result.destination) return;
    const reorderedFavLocations = [...favoriteLocations];
    const [movedFavLocation] = reorderedFavLocations.splice(
      result.source.index,
      1
    );
    reorderedFavLocations.splice(result.destination.index, 0, movedFavLocation);
    setFavoriteLocations(reorderedFavLocations);
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
    setIsDragEnabled(!isDragEnabled);
    if (favLocationContainer.classList.contains(styles.edit))
      favLocationContainer.classList.remove(styles.edit);
    else favLocationContainer.classList.add(styles.edit);
  };
  const handleDeleteButtonClick = (deletedFavoriteLocation) => {
    const deletedFavLocationIndex = favoriteLocations.indexOf(
      deletedFavoriteLocation
    );
    const favLocationContainer = document.querySelector(
      `.${styles.favLocationContainer}`
    );

    if (
      favoriteLocations.length === 1 &&
      favLocationContainer.classList.contains(styles.edit)
    ) {
      favLocationContainer.classList.remove(styles.edit);
      setIsDragEnabled(false);
    }
    const cloneFavLocations = [...favoriteLocations];
    cloneFavLocations.splice(deletedFavLocationIndex, 1); 
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
              className={styles.favLocationContainer}
            >
              {favoriteLocations.length > 0 &&
                favoriteLocations.map((favoriteLocation, index) => {
                  const generatedKey =
                    favoriteLocation.locationName +
                    favoriteLocation.currentWeather.temperature +
                    favoriteLocation.currentWeather.weatherCode;

                  return (
                    <FavLocation
                      key={generatedKey}
                      id={generatedKey}
                      index={index}
                      favoriteLocationData={favoriteLocation}
                      isDragDisabled={!isDragEnabled}
                      onDeleteButtonClick={handleDeleteButtonClick}
                      onFavoriteLocationClick={() => {
                        setPopUp(null);
                        onFavLocationClickAddFavLocationData(favoriteLocation);
                      }}
                      onSortButtonMouseDown={() => setIsElementDragged(true)}
                      popUp={popUp}
                    />
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
