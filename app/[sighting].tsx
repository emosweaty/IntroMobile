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
        <View style={styles.container}>
            <Text style={{...styles.title, fontSize: 32, fontWeight: 800, letterSpacing: 1.5}}>{detail?.witnessName}</Text>
            <Text style={styles.title}>Description</Text>
            <Text style={{...styles.text, fontStyle: 'italic'}}>"{detail?.description}"</Text>
            <Text style={styles.title}>Location</Text>
            <Text style={styles.text}>{detail?.location.latitude}, {detail?.location.longitude}</Text>
            <Text style={styles.title}>Status</Text>
            <Text style={styles.text}>{detail?.status}</Text>
        </View>
    )
}


 const styles = StyleSheet.create({
        title: {
            fontSize: 20,
            fontWeight: 700,
            paddingTop: 25,
            paddingBottom: 5,
            color: 'red'
        },
        text:{
            paddingLeft: 15,
        },
        container:{
            backgroundColor: 'white',
            padding: 20,
            paddingLeft: 30,
            paddingRight: 30,
            borderRadius: 15,
            margin: 40,
            paddingBottom: 40
        }
});