"use client";

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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
        description: e.description,
        status: e.status,
        location: { latitude: e.location.latitude, longitude: e.location.longitude }
      })));
    }
    loadMarkers();
  }, [sightings]);

  const addPointOfInterest = (lat: number, lng: number, name = "New Point", description = "niks", status ="") => {
    if(status=="") status="unconfirmed";
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
            <form style={styles.form} onSubmit={handleSubmit}>
              <label>
                Name:
              </label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  />
              <label>
                Description:
              </label>
                <textarea
                  style={{ ...styles.input, width: "100%", height: 60, maxHeight: "100px", overflowY: "auto", resize: "none", wordWrap: "break-word" }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
              <label>
                Confirmed:
                <input
                style={styles.input}
                  type="checkbox"
                  checked={formData.status === "confirmed"}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    status: e.target.checked ? "confirmed" : "unconfirmed" 
                  })}
                  />
              </label>
              <br />
              <button style={{...styles.button, border: 'none'}} type="submit">Add</button>
            </form>
          </Popup>
        </Marker>
      )}

      {}
      {pointsOfInterest.map((point) => (
        <Marker key={point.id} position={[point.location.latitude, point.location.longitude]} icon={iconX}>
          <Popup>
            <View style={{ backgroundColor: "white", padding: 10, width: 150}}>
              <Text style={{fontWeight: 'bold', color: 'red'}}>{point.witnessName}</Text>
              <Text style={{marginTop: 5}}>{point.description}</Text>
              <Link
                href={{
                  pathname: "/[sighting]",
                  params: { sighting: `${point.id}` },
                }}
                asChild
                >
                <Pressable>
                  <Text style={styles.button}>More</Text>
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

const styles = StyleSheet.create({
  form:{
    maxWidth: 150
  },
  input: {
    borderRadius: 15,
    borderWidth: 1.5,
    marginTop: 3,
    marginBottom: 3,
    maxWidth: 140
 },
 button:{
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 15,
    width: 50,
    height: 25,
    textAlign: 'center',
    fontWeight: '500',
    paddingTop: 1,
    marginTop: 10,
 }
})
