import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";

import getSightings from "../services/getSightingsService";

interface Sighting {
    id: string
    witnessName: string;
    location: {
        latitude: string;
        longitude: string;
    }
    description: string;
    status: string;

}

//TODO kan dit korter?

export default function details(){
    const { sighting } = useLocalSearchParams<{sighting: string}>();
    const [ detail, setDetail ] = useState<Sighting>(); 
    useEffect(()=>{
        fetchSightings(sighting);
    }, [sighting]);
    async function fetchSightings(sighting: string) {
        try {
            const data = await getSightings(); 
            const found = data.find((item: Sighting) => item.id == sighting);
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