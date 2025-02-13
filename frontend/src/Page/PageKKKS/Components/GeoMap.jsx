import { MapContainer, TileLayer, GeoJSON, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useState, useEffect } from "react";


export default function GeoMap({
  geo,
  center,
  zoom,
  onEachFeature,
  height,
  width,
}) {
  const [isDataReady, setIsDataReady] = useState(false);


  // Konfigurasi ikon default
  useEffect(() => {
    let DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });


    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);


  useEffect(() => {
    if (geo && center && Array.isArray(center) && center.length === 2) {
      setIsDataReady(true);
    } else {
      setIsDataReady(false);
    }
  }, [geo, center]);


  if (!isDataReady) {
    return <div>Loading map data...</div>;
  }


  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ 
        height: height || '400px', 
        width: width || '100%' 
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON 
        data={geo} 
        onEachFeature={onEachFeature}
        pointToLayer={(feature, latlng) => {
          return L.marker(latlng);
        }}
      />
    </MapContainer>
  );
}