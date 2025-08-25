import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 15);
  }, [coords, map]);
  return null;
}

export default function PropertyMap({ address, title, imageUrl, details }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!address) return;
    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
          { headers: { "User-Agent": "my-real-estate-app/1.0 (me@example.com)" } }
        );
        const data = await res.json();
        if (data.length > 0) setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        else setCoords([6.5244, 3.3792]); // fallback Lagos
      } catch {
        setCoords([6.5244, 3.3792]);
      }
    };
    fetchCoords();
  }, [address]);

  if (!coords)
    return (
      <div style={{ width: "100%", height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading map...
      </div>
    );

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <MapContainer center={coords} zoom={13} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <RecenterMap coords={coords} />
        <Marker position={coords}>
          <Popup>
            <div style={{ maxWidth: "220px" }}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title}
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                />
              )}
              <h4>{title || "Disaster"}</h4>
              <p style={{ fontSize: "12px", color: "#555" }}>{address || "Unknown Address"}</p>
            
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
