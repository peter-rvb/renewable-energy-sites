import React, { useState } from "react";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";

function Map({mapWidth, mapHeight, energySites}) {
  const [activeMarker, setActiveMarker] = useState(null);

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const handleOnLoad = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    energySites.forEach(({ coordinates }) => bounds.extend(coordinates));
    map.fitBounds(bounds);
  };

  const composeInfoWindow = (energySite) => {
    return <>
        <h2>{energySite.siteName}</h2>
        <div style={{fontSize:"12px"}} id="bodyContent">
            <p><b>{energySite.siteId}</b></p>
            <p><b>Operational Date: </b>{energySite.opDate}</p>
            <p>{energySite.description}</p>
            <p><a target="_blank" href={energySite.url}>Click to update in Workday</a></p>
        </div>
    </>
  }

  return (
    <GoogleMap
      onLoad={handleOnLoad}
      onClick={() => setActiveMarker(null)}
      mapContainerStyle={{ width: mapWidth, height: mapHeight }}
      center={energySites[0] ? energySites[0].coordinates : {lat: 0, lng: 0}}
      zoom={10}
    >
      
        {energySites.map((energySite) => {
            // console.log(energySite.siteName)
            return (      
              <Marker
                  key={energySite.key}
                  position={energySite.coordinates}
                  onClick={() => handleActiveMarker(energySite.workdayId)}
              >
              {activeMarker === energySite.workdayId ? (
                  <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                      <div>{composeInfoWindow(energySite)}</div>
                  </InfoWindow>
              ) : null}
              </Marker>
          )}
        )}
    </GoogleMap>
  );
}

export default Map;