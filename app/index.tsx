import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { View, Text, Pressable, StyleSheet, TextInput, Button } from "react-native";
import { Link, useRouter } from "expo-router";

import { useSightings, Sighting } from "./SightingContext";

interface Location {
  latitude: number;
  longitude: number;
}

const Index = () => {
  const [pointsOfInterest, setPointsOfInterest] = useState<Sighting[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formLocation, setFormLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: "unconfirmed" });
  const router=useRouter();
  const { sightings, addSighting } = useSightings();

  useEffect(() => {
    async function loadMarkers() {
      setPointsOfInterest(
        sightings.map((e: Sighting) => ({
          id: e.id || 0,
          witnessName: e.witnessName || "New Point",
          description: e.description,
          status: e.status,
          location: { latitude: e.location.latitude, longitude: e.location.longitude },
        }))
      );
    }
    loadMarkers();
  }, [sightings]);

  const addPointOfInterest = (latitude: number, longitude: number, name = "New Point", description = "N/A", status = "unconfirmed") => {
    const newSighting = {
      id: pointsOfInterest.length + 1,
      witnessName: name,
      description: description,
      status: status,
      location: { latitude, longitude },
    };
    setPointsOfInterest([...pointsOfInterest, newSighting]);
    addSighting(newSighting);
    setFormVisible(false);
  };

  const handleMapPress = (event: any) => {
    setFormLocation(event.nativeEvent.coordinate);
    setFormVisible(true);
  };

  const handleSubmit = () => {
    if (formLocation) {
      addPointOfInterest(formLocation.latitude, formLocation.longitude, formData.name, formData.description, formData.status);
      setFormData({ name: "", description: "", status: "unconfirmed" });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.505,
          longitude: -0.09,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {pointsOfInterest.map((point) => (
          <Marker key={point.id} coordinate={point.location} title={point.witnessName} description={point.description} onCalloutPress={() => {
            router.push({
              pathname: "/[sighting]",
              params: { sighting: `${point.id}` },
            });
          }} />
        ))}
      </MapView>

      {formVisible && formLocation && (
        <View style={styles.formContainer}>
          <Text>Name:</Text>
          <TextInput style={styles.input} value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} />
          
          <Text>Description:</Text>
          <TextInput style={styles.input} value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} />

          <View style={styles.checkboxContainer}>
            <Text>Confirmed:</Text>
            <Pressable
              style={[styles.checkbox, formData.status === "confirmed" ? styles.checked : styles.unchecked]}
              onPress={() => setFormData({ ...formData, status: formData.status === "confirmed" ? "unconfirmed" : "confirmed" })}
            >
              <Text style={styles.checkboxText}>{formData.status === "confirmed" ? "✔" : ""}</Text>
            </Pressable>
          </View>

          <Button title="Add" onPress={handleSubmit} />
        </View>
      )}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  formContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  checked: {
    backgroundColor: "green",
    borderColor: "green",
  },
  unchecked: {
    backgroundColor: "white",
    borderColor: "#ccc",
  },
  checkboxText: {
    color: "white",
    fontWeight: "bold",
  },
});
