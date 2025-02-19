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
        <View>
            <Stack.Screen options={{title: detail?.witnessName}}></Stack.Screen>
            <Text>Location: {detail?.location.latitude}, {detail?.location.longitude}</Text>
            <Text>Description: {detail?.description}</Text>
            <Text>Status: {detail?.status}</Text>
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
});