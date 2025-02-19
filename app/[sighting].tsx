import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";

import {useSightings, Sighting} from "./SightingContext";

//TODO kan dit korter?

export default function details(){
    const { sighting } = useLocalSearchParams<{sighting: string}>();
    const [ detail, setDetail ] = useState<Sighting>(); 
    const { sightings, addSighting } = useSightings();


    useEffect(()=>{
        fetchSightings(sighting);
    }, [sighting]);
    async function fetchSightings(sighting: string) {
        try {
            const found = sightings.find((item: Sighting) => item.id.toString() == sighting);
            setDetail(found); 
        } catch (err) {
            console.error("Failed to fetch sightings", err);
        }
    }

    return(
        <View style={{marginLeft: 25, marginTop: 10}}>
            <Stack.Screen options={{title: detail?.witnessName}}></Stack.Screen>
            <Text style={styles.title}>Description</Text>
            <Text style={styles.text}>{detail?.description}</Text>
            <Text style={styles.title}>Location</Text>
            <Text style={styles.text}>{detail?.location.latitude}, {detail?.location.longitude}</Text>
            <Text style={styles.title}>Status</Text>
            <Text style={styles.text}>{detail?.status}</Text>
        </View>
    )
}

 const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 50,
        },
        item: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
        },
        product: {
            fontSize: 18,
        },
        title: {
            fontSize: 20,
            fontWeight: 700,
            paddingTop: 20,
            paddingBottom: 5,
            color: 'red'
        },
        text:{
            paddingLeft: 15
        }
});