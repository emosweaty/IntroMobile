import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Button, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from 'expo-image-picker';
import { useSightings, Sighting } from "./SightingContext";
import { FontAwesome } from '@expo/vector-icons';

interface Location {
  latitude: number;
  longitude: number;
}

const Index = () => {
  const [pointsOfInterest, setPointsOfInterest] = useState<Sighting[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formLocation, setFormLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: "unconfirmed", imageUri: "" });

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
          imageUri: e.imageUri || "",
        }))
      );
    }
    loadMarkers();
  }, [sightings]);

  const addPointOfInterest = (
    latitude: number,
    longitude: number,
    name = "New Point",
    description = "N/A",
    status = "unconfirmed",
    imageUri = ""
  ) => {
    const newSighting = {
      id: pointsOfInterest.length + 1,
      witnessName: name,
      description: description,
      status: status,
      location: { latitude, longitude },
      imageUri: imageUri,
    };
    setPointsOfInterest([...pointsOfInterest, newSighting]);
    addSighting(newSighting);
    setFormVisible(false);
  };

  const handleMapPress = (event: any) => {
    console.log(event.nativeEvent.coordinate);
    setFormLocation(event.nativeEvent.coordinate);
    setFormVisible(true);
  };

  const handleSubmit = () => {
    if (formLocation) {
      addPointOfInterest(
        formLocation.latitude,
        formLocation.longitude,
        formData.name,
        formData.description,
        formData.status,
        formData.imageUri
      );
      setFormData({ name: "", description: "", status: "unconfirmed", imageUri: "" });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, imageUri: result.assets[0].uri });
    } else {
      alert('You did not select any image.');
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
          <Marker key={point.id} coordinate={point.location} title={point.witnessName} description={point.description}
          >
            {point.imageUri ? (
              <Image source={{ uri: point.imageUri }} style={styles.markerImage} />
            ) : null}
          </Marker>
        ))}
      </MapView>

      {formVisible && formLocation && (
        <View style={styles.formContainer}>
          <Text>Name:</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text>Description:</Text>
          <TextInput
            style={{...styles.input, height: 80}}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
          />

          <View style={styles.checkboxContainer}>
            <Text>Confirmed:</Text>
            <Pressable
              style={[styles.checkbox, formData.status === "confirmed" ? styles.checked : styles.unchecked]}
              onPress={() => setFormData({ ...formData, status: formData.status === "confirmed" ? "unconfirmed" : "confirmed" })}
            >
              <Text style={styles.checkboxText}>{formData.status === "confirmed" ? "\u2713" : ""}</Text>
            </Pressable>
          </View>

          {formData.imageUri && (
            <Image source={{ uri: formData.imageUri }} style={styles.previewImage} />
          )}
          <View style={styles.buttonContainer}>

            <Pressable style={styles.button} onPress={pickImage}>
              <FontAwesome name="camera" size={20} color="white" />
            </Pressable>

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
          </View>
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
    padding: 30,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    padding: 8,
    marginBottom: 15,
    marginTop: 5
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: "red",
    borderColor: "black",
  },
  unchecked: {
    backgroundColor: "white",
    borderColor: "#ccc",
  },
  checkboxText: {
    color: "white",
    fontWeight: "900",
    fontSize: 13,
    lineHeight: 17
  },
  markerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  button:{
    backgroundColor: "red",
    borderRadius: 15,
    minWidth: 100,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText:{
    color: "white",
    textTransform: "uppercase",
    fontWeight: "600",
    textAlign: 'center',
  },
  buttonContainer:{
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 5,
  }
});
