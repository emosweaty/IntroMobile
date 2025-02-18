import axios from 'axios';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';

import getSightings from "../services/getSightingsService";
import { Link } from 'expo-router';

interface Sighting {
    id: number
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
                <Link href={{
                    pathname: "/[sighting]",
                    params: {sighting: `${item.id}`}
                }} asChild>
                    <Pressable>
                        <Text style={styles.product}> {item.witnessName}</Text>
                    </Pressable>
                </Link>
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <FlatList
                data={sightings}
                renderItem={renderSighting}
                keyExtractor={(item)=> item.id.toString()}
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



