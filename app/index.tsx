import React, { useState, useEffect, useRef } from "react";
import { View,Button, Text, Pressable, StyleSheet, TextInput, Image, Modal, Animated, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useSightings, Sighting } from "./SightingContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from 'expo-location';

interface Location {
  latitude: number;
  longitude: number;
}

const Index = () => {
  const [pointsOfInterest, setPointsOfInterest] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [formLocation, setFormLocation] = useState<Location | null>(null);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [errors, setErrors] = useState({ name: false, description: false, date: false });
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  const onChange = (event: any, selectedDate: any) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
      setFormData({ ...formData, dateTime: selectedDate.toISOString() });
      setErrors((prev)=>({...prev, date: false}))
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "unconfirmed",
    picture: "",
    dateTime: new Date().toISOString(),
    witnessContact: "",
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
          longitude: e.location.longitude,
        },
        picture: e.picture || "",
        dateTime: e.dateTime,
        witnessContact: e.witnessContact,
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
  }, [modalVisible]);

  useEffect(() => {
    if (formVisible) {
      Animated.spring(formScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      formScaleAnim.setValue(0.8);
    }
  }, [formVisible]);

  const handleMapPress = (event: any) => {
    setFormLocation(event.nativeEvent.coordinate);
    setFormVisible(true);
  };

  const handleMarkerPress = (point: Sighting) => {
    setSelectedSighting(point);
    setModalVisible(true);
  };

  const validateEmail = (text: string)=> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(text));
    setFormData({...formData, witnessContact: text});
  }

  const handleSubmit = () => {
    let newErrors = {name: false, description: false, date: false};
    const currentDate = new Date();
    const submittedDate = new Date(formData.dateTime);

    if (!formData.name.trim()) { newErrors.name = true; }
    if (!formData.description.trim()) { newErrors.description = true; }
    if (submittedDate > currentDate) { newErrors.date = true; }

    setErrors(newErrors);

    if(newErrors.name || newErrors.description || !emailValid || newErrors.date){
      return;
    }
   
    if (formLocation) {
      const newSighting = {
        id: pointsOfInterest.length + 1,
        witnessName: formData.name,
        description: formData.description,
        status: formData.status,
        location: formLocation,
        picture: formData.picture,
        dateTime: formData.dateTime,
        witnessContact: formData.witnessContact,
      };
      setPointsOfInterest([...pointsOfInterest, newSighting]);
      addSighting(newSighting);
      setFormData({
        name: "",
        description: "",
        status: "unconfirmed",
        picture: "",
        dateTime: new Date().toISOString(),
        witnessContact: "",
      });
      setFormVisible(false);
    }
  };

  const getCurrentLocation = async () => {
    const permissionResponse = await Location.requestForegroundPermissionsAsync();
    if (permissionResponse.status !== "granted") {
      Alert.alert("Permission denied", "Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setFormLocation({ latitude, longitude });
    setFormVisible(true);
  }

  const storeImageLocally = async (uri: string, useCopy: boolean = true): Promise<string> => {
    const dir = FileSystem.documentDirectory + "sightingImages";
    const fileName = `${Date.now()}.jpg`;
    const newPath = `${dir}/${fileName}`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    if (useCopy) {
      await FileSystem.copyAsync({ from: uri, to: newPath });
    } else {
      await FileSystem.moveAsync({ from: uri, to: newPath });
    }
    return newPath;
  };

  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const localUri = await storeImageLocally(result.assets[0].uri, true);
      setFormData({ ...formData, picture: localUri });
    }
    setImagePickerVisible(false);
  };

  const pickImageFromCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const localUri = await storeImageLocally(result.assets[0].uri, false);
      setFormData({ ...formData, picture: localUri });
    }
    setImagePickerVisible(false);
  };

  const handeAdressSubmit = async () => {
    try{
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`,
        {
          headers: {
            "User-Agent": "UfoSighting/1.0 (contact@gmail.com)",
            "Accept": "application/json"
          }
        }
      );
  
      if (!res.ok) {
        Alert.alert("Error", "Failed to fetch address data.");
        return;
      }
      const data = await res.json();
      if (data && data.length > 0){
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        setFormLocation({latitude: lat, longitude: lon});
        setAddressModalVisible(false);
        setFormVisible(true);
        setAddressInput("");
      } else {
        Alert.alert("Error", "Address not found. Please try another address.");
      }
    }catch (err){
      console.log(err);
    }
  }

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
            {point.picture ? (
              <Image
                source={{ uri: point.picture }}
                style={styles.markerImage}
              />
            ) : null}
          </Marker>
        ))}
      </MapView>

      <Pressable
          style={[styles.closeButtonCommon, {backgroundColor: 'red', width: 50, height: 50}]}
        onPress={()=> setAddressModalVisible(true)}>
          <FontAwesome name="map-marker" size={35} color="white" />
      </Pressable>

      <Pressable
        style={[styles.closeButtonCommon, {backgroundColor: 'red', width: 50, height: 50, marginTop: 60}]}
        onPress={getCurrentLocation}>
        <FontAwesome name="crosshairs" size={35} color="white" />
      </Pressable>
        
      <Modal visible={addressModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: "red" }]}>
              Enter Address
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Type address here..."
              value={addressInput}
              onChangeText={(text) => setAddressInput(text)}
            />
              <Pressable style={styles.button} onPress={handeAdressSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </Pressable>
              <Pressable
              style={styles.closeButtonCommon}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScaleAnim }] },
            ]}
          >
            <Pressable
              style={styles.closeButtonCommon}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
            {selectedSighting && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedSighting.witnessName}
                </Text>
                <Text style={styles.description}>
                  "{selectedSighting.description}"
                </Text>
                {selectedSighting.picture && (
                  <Image
                    source={{ uri: selectedSighting.picture }}
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

      <Modal visible={imagePickerVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={[styles.modalTitle, { color: "red", fontSize: 20, letterSpacing: 1 }]}>
              Select Image
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.button} onPress={pickImageFromCamera}>
                <FontAwesome name="camera" size={20} color="white" />
              </Pressable>
              <Pressable style={styles.button} onPress={pickImageFromGallery}>
                <FontAwesome name="image" size={20} color="white" />
              </Pressable>
            </View>
            <Pressable
              style={styles.closeButtonCommon}
              onPress={() => setImagePickerVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={formVisible && !!formLocation} transparent animationType="fade">
        <View style={styles.modalContainer}>
            <Animated.View
              style={[styles.formContainer, { transform: [{ scale: formScaleAnim }] }]}
            >
              <Pressable
                style={styles.closeButtonCommon}
                onPress={() => setFormVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </Pressable>
              <Text
                style={[styles.modalTitle,{ color: "red", fontSize: 20, letterSpacing: 1 }]}>
                Add a new sighting
              </Text>
              <Text style={[styles.label, errors.name && styles.errorText]}>Name:</Text>
              <TextInput
                style={[styles.input, errors.name && styles.errorBorder]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <Text style={[styles.label, errors.description && styles.errorText]}>Description:</Text>
              <TextInput
                style={[styles.input, { height: 80 }, errors.description && styles.errorBorder]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.label, !emailValid && styles.errorText]}>Email:</Text>
              <TextInput
                style={[styles.input, !emailValid && styles.errorBorder]}
                value={formData.witnessContact}
                inputMode="email"
                keyboardType="email-address"
                onChangeText={validateEmail}
              />
              <Text>Date: <Text style={styles.description}>{date.toDateString()}</Text></Text>
              {errors.date && <Text style={styles.errorText}>The date cannot be in the future.</Text>}
              <Pressable style={[styles.button, {marginBottom: 15}]} onPress={() => setShow(true)} >
                <Text style={styles.buttonText}>Select a date</Text>
              </Pressable>
              {show && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onChange}
                />
              )}
              <View style={styles.checkboxContainer}>
                <Text>Confirmed:</Text>
                <Pressable
                  style={[styles.checkbox, formData.status === "confirmed" ? styles.checked : styles.unchecked]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      status:
                        formData.status === "confirmed" ? "unconfirmed" : "confirmed",
                    })
                  }
                >
                  <Text style={styles.checkboxText}>
                    {formData.status === "confirmed" ? "\u2713" : ""}
                  </Text>
                </Pressable>
              </View>
              {formData.picture && (
                <Image source={{ uri: formData.picture }} style={styles.previewImage} />
              )}
              <View style={styles.buttonContainer}>
                <Pressable
                  style={styles.button}
                  onPress={() => setImagePickerVisible(true)}
                >
                  <FontAwesome name="camera" size={20} color="white" />
                </Pressable>
                <Pressable style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>
      
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {width: "100%", height: "100%"},
  markerImage: {width: 30, height: 30, borderRadius: 15},
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
  closeButtonText: {fontWeight: "bold", color: "white"},
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
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10},
  checkbox: {
    width: 20,
    height: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  checked: {backgroundColor: "red", borderColor: "black"},
  unchecked: {backgroundColor: "white", borderColor: "#ccc"},
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
  description: {fontStyle: "italic", fontFamily: "arial"},
  errorBorder:{borderColor: 'red'},
  errorText:{color: 'red'},
  label:{fontSize: 15},
});
