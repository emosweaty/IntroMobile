import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';

import {useSightings, Sighting} from "./SightingContext";
import { useRouter } from 'expo-router';

export default function List(){
    let {sightings, addSighting} = useSightings(); 
    const router = useRouter();
    
    const Button = ({ label, onPress }: { label: string; onPress: () => void }) => {
        const [isHovered, setIsHovered] = useState(false);
      
        return (
            
          <Pressable
            onPress={onPress}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={[styles.button, isHovered && styles.hover]}
          >
            <Text style={[styles.name, isHovered && styles.hovertext]}>
              {label}
            </Text>
          </Pressable>
        );
      };

    useEffect(() => {
        console.log(sightings);
    }, [useSightings().sightings]);
    
    function renderSighting({ item }: { item: Sighting }){
        return(
            <View style={styles.item}>
                <Button label={item.witnessName}
                    onPress={() =>
                        router.push({
                            pathname: "/[sighting]",
                            params: { sighting: `${item.id}` },
                        })}
                ></Button>
                <Text style={{fontFamily: 'arial', fontStyle: 'italic', paddingLeft: 15}}>"{item.description}"</Text>
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
            padding: 20,
            margin: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
            backgroundColor: 'white',
            borderRadius: 15,
            minWidth: 300
        },
        name: {
            fontSize: 18,
            color: 'white',
            textAlign: 'center',
            fontWeight: 600,
        },
        button:{
            backgroundColor: 'red',
            width: '55%',
            height: 30,
            borderRadius: 15,
            marginBottom: 10,
            alignItems: 'center',
            justifyContent: 'center'
        },
        hover:{
            width: '54%',
            height: 29,
            margin: 1,
            backgroundColor: 'orange'
        },
        hovertext:{
            fontSize: 17
        }
    });



