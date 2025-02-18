import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function details(){
    const { sighting } = useLocalSearchParams<{sighting: string}>();
    return(
        <View>
            <Stack.Screen options={{title: sighting}}></Stack.Screen>
        </View>
    )
}