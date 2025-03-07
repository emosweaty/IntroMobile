import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Image, Modal, Animated } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { useSightings, Sighting } from "./SightingContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Location {
  latitude: number;
  longitude: number;
}

const Index = () => {
  const [pointsOfInterest, setPointsOfInterest] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formLocation, setFormLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    status: "unconfirmed", 
    imageUri: "" 
  });
  const { sightings, addSighting } = useSightings();
  const router = useRouter();
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const formScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    setPointsOfInterest(
      sightings.map((e: Sighting) => ({
        id: e.id || 0,
        witnessName: e.witnessName || "New Point",
        description: e.description,
        status: e.status,
        location: { 
          latitude: e.location.latitude, 
          longitude: e.location.longitude 
        },
        imageUri: e.imageUri || "",
      }))
    );
  }, [sightings]);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleAnim.setValue(0.8);
    }
  }, [modalVisible, modalScaleAnim]);

  useEffect(() => {
    if (formVisible) {
      Animated.spring(formScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      formScaleAnim.setValue(0.8);
    }
  }, [formVisible, formScaleAnim]);

  const handleMapPress = (event: any) => {
    setFormLocation(event.nativeEvent.coordinate);
    setFormVisible(true);
  };

  const handleMarkerPress = (point: Sighting) => {
    setSelectedSighting(point);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (formLocation) {
      const newSighting = {
        id: pointsOfInterest.length + 1,
        witnessName: formData.name,
        description: formData.description,
        status: formData.status,
        location: formLocation,
        imageUri: formData.imageUri,
      };
      setPointsOfInterest([...pointsOfInterest, newSighting]);
      addSighting(newSighting);
      setFormData({ name: "", description: "", status: "unconfirmed", imageUri: "" });
      setFormVisible(false);
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
      alert("You did not select any image.");
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
          <Marker 
            key={point.id} 
            coordinate={point.location} 
            onPress={() => handleMarkerPress(point)}
          >
            {point.imageUri ? (
              <Image source={{ uri: point.imageUri }} style={styles.markerImage} />
            ) : null}
          </Marker>
        ))}
      </MapView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScaleAnim }] }]}>
            <Pressable 
              style={styles.closeButtonCommon} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
            {selectedSighting && (
              <>
                <Text style={styles.modalTitle}>{selectedSighting.witnessName}</Text>
                <Text  style={styles.description}>"{selectedSighting.description}"</Text>
                {selectedSighting.imageUri && (
                  <Image 
                    source={{ uri: selectedSighting.imageUri }} 
                    style={styles.previewImageModal} 
                  />
                )}
                <Pressable
                  style={styles.button}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: "/[sighting]",
                      params: { sighting: `${selectedSighting.id}` },
                    });
                  }}
                >
                  <Text style={styles.buttonText}>View Details</Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {formVisible && formLocation && (
        <Animated.View style={[styles.formContainer, { transform: [{ scale: formScaleAnim }] }]}>
          <Pressable 
            style={styles.closeButtonCommon} 
            onPress={() => setFormVisible(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
          <Text style={[styles.modalTitle, { color: "red", fontSize: 20, letterSpacing: 1 }]}>
            Add a new sighting
          </Text>
          <Text>Name:</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <Text>Description:</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.checkboxContainer}>
            <Text>Confirmed:</Text>
            <Pressable
              style={[
                styles.checkbox,
                formData.status === "confirmed" ? styles.checked : styles.unchecked,
              ]}
              onPress={() =>
                setFormData({
                  ...formData,
                  status: formData.status === "confirmed" ? "unconfirmed" : "confirmed",
                })
              }
            >
              <Text style={styles.checkboxText}>
                {formData.status === "confirmed" ? "\u2713" : ""}
              </Text>
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
        </Animated.View>
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
  markerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  closeButtonCommon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ccc",
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    fontWeight: "bold",
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "red",
  },
  previewImageModal: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  formContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 30,
    paddingTop: 40,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    padding: 8,
    marginBottom: 15,
    marginTop: 5,
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
    lineHeight: 17,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "red",
    borderRadius: 15,
    minWidth: 100,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textTransform: "uppercase",
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 5,
  },
  description:{
    fontStyle: 'italic',
    fontFamily: 'arial'
  }
});
