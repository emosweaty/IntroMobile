import axios from 'axios';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';

import {useSightings, Sighting} from "../services/getSightingsService";
import { Link } from 'expo-router';

export default function List(){
    const { sightings, addSighting } = useSightings(); 

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
                extraData={sightings}
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



