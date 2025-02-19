"use client";

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import {useSightings, Sighting} from "./SightingContext";

interface Location {
  lat: number;
  lng: number;
}

const Index = () => {
  const [pointsOfInterest, setPointsOfInterest] = useState<Sighting[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formLocation, setFormLocation] = useState<Location>();
  const [formData, setFormData] = useState({ name: "", description: "", status: "" });

  const { sightings, addSighting } = useSightings();

  const iconX = L.icon({
    iconUrl: "https://raw.githubusercontent.com/similonap/public_icons/refs/heads/main/location-pin.png",
    iconSize: [48, 48],
    popupAnchor: [-3, 0],
  });
  useEffect(() => {
    async function loadMarkers() {
      setPointsOfInterest(sightings.map((e: Sighting) => ({
        id: e.id || 0,
        witnessName: e.witnessName || "New Point",
        location: { latitude: e.location.latitude, longitude: e.location.longitude }
      })));
    }
    loadMarkers();
  }, [sightings]);

  const addPointOfInterest = (lat: number, lng: number, name = "New Point", description = "niks", status ="unconfirmed") => {
    console.log(status);
    const newSighting = {
      id: pointsOfInterest.length + 1,
      witnessName: name,
      description: description,
      status:status,
      location: { latitude: lat, longitude: lng }
    };
    setPointsOfInterest([...pointsOfInterest,  newSighting]);
    addSighting(newSighting);
    setFormVisible(false);
  };

  const LocationHandler = () => {
    useMapEvents({
      click(e) {
        setFormLocation(e.latlng);
        
        setFormVisible(true);
      },
    });
    return null;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (formLocation && formLocation.lat && formLocation.lng) {
      addPointOfInterest(formLocation.lat, formLocation.lng, formData.name, formData.description, formData.status);

      setFormData({ name: "", description: "", status: "" });
    }
  };

  return (
    <MapContainer
      center={{ lat: 51.505, lng: -0.09 }}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      attributionControl={false}
      >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationHandler />

      {}
      {formVisible && formLocation && (
        <Marker position={[formLocation.lat, formLocation.lng]} icon={iconX}>
          <Popup>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  />
              </label>
              <br />
              <label>
                Description:
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
              </label>
              <br />
              <label>
                Confirmed:
                <input
                  type="checkbox"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "confirmed" : "unconfirmed" })}
                  />
              </label>
              <br />
              <button type="submit">Add</button>
            </form>
          </Popup>
        </Marker>
      )}

      {}
      {pointsOfInterest.map((point) => (
        <Marker key={point.id} position={[point.location.latitude, point.location.longitude]} icon={iconX}>
          <Popup>
            <View style={{ backgroundColor: "white", padding: 10, width: 100 }}>
              <Link
                href={{
                  pathname: "/[sighting]",
                  params: { sighting: `${point.id}` },
                }}
                asChild
                >
                <Pressable>
                  <Text style={{ textDecorationLine: "underline" }}>{point.witnessName}</Text>
                </Pressable>
              </Link>
            </View>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Index;
