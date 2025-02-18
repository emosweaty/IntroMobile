import axios from 'axios';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';

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

export default function List(){
    const [ sightings, setSightings ] = useState<Sighting[]>([]); 

    useEffect(()=>{
        fetchSightings()
    }, []);

    async function fetchSightings() {
        try {
            const data = await getSightings(); 
            setSightings(data); 
        } catch (err) {
            console.error("Failed to fetch sightings", err);
        }
    }

    function renderSighting({ item }: { item: Sighting }){
        return(
            <View style={styles.item}>
                <Text style={styles.product}> {item.witnessName} | {item.location.latitude}, {item.location.longitude} | {item.description} | {item.status}</Text>
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <FlatList
                data={sightings}
                renderItem={renderSighting}
                keyExtractor={(item)=> item.id}
            >    
            </FlatList>
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



