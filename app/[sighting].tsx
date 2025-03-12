import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";

import { useSightings, Sighting } from "./SightingContext";

export default function Details() {
  const { sighting } = useLocalSearchParams<{ sighting: string }>();
  const [detail, setDetail] = useState<Sighting>();
  const { sightings } = useSightings();

  useEffect(() => {
    fetchSightings(sighting);
  }, [sighting]);

  async function fetchSightings(sighting: string) {
    try {
      const found = sightings.find(
        (item: Sighting) => item.id.toString() === sighting
      );
      setDetail(found);
    } catch (err) {
      console.error("Failed to fetch sightings", err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, styles.largeTitle]}>{detail?.witnessName}</Text>
      <Text style={[styles.text, {paddingLeft: 5}]}>{detail?.witnessContact}</Text>
      <Text style={styles.title}>Description</Text>
      <Text style={[styles.text, styles.italicText]}>"{detail?.description}"</Text>
      <Text style={styles.title}>Date</Text>
      <Text style={[styles.text, styles.italicText]}>{new Date(Date.parse(detail?.dateTime!)).toDateString()}</Text>
      <Text style={styles.title}>Location</Text>
      <Text style={styles.text}>
        {detail?.location
          ? `${detail.location.latitude.toFixed(2)}, ${detail.location.longitude.toFixed(2)}`
          : ""}
      </Text>

      <Text style={styles.title}>Status</Text>
      <Text style={styles.text}>{detail?.status}</Text>

      {detail?.picture && (
        <Image source={{ uri: detail.picture }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    paddingTop: 25,
    paddingBottom: 5,
    color: "red",
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  text: {
    paddingLeft: 15,
  },
  italicText: {
    fontStyle: "italic",
    fontFamily: "arial",
  },
  container: {
    backgroundColor: "white",
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 15,
    margin: 40,
    paddingBottom: 40,
  },
  image: {
    marginTop: 20,
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
});
