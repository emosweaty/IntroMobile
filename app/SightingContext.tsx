import { createContext, useState , ReactNode, useEffect, useContext} from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Sighting {
    id: number
    witnessName: string;
    location: {
        latitude: number;
        longitude: number;
    }
    description?: string;
    status?: string;
    imageUri?: string;
}
interface SightingContextType {
    sightings: Sighting[];
    addSighting: (newSighting: Sighting) => void;
}

const SightingContext = createContext<SightingContextType|undefined>(undefined);

export const SightingsProvider = ({ children }: { children: ReactNode })=> {
    const [sightings, setSightings] = useState<Sighting[]>([]);
    useEffect(()=> {
        const fetchSightings = async () => {
            try {
                let data = await AsyncStorage.getItem('sightings');
                if(data===null) {
                    const response = await axios.get("https://sampleapis.assimilate.be/ufo/sightings");
                    const apiSightings = response.data;

                    await AsyncStorage.setItem("sightings", JSON.stringify(apiSightings));
                    await setSightings(apiSightings);
                }
                else {
                    setSightings(JSON.parse(data));
                }
              } catch (error) {
                console.error("Error fetching sightings:", error);
              }
        }
        fetchSightings();
    }, []);
    const addSighting = async (newSighting: Sighting) => {
        try {
            let updatedSightings = [...sightings, newSighting]
            await AsyncStorage.setItem("sightings", JSON.stringify(updatedSightings));
            setSightings(updatedSightings);
        }
        catch (error) {
            console.error("error saving new sighting", error)
        }
    }
    return (
        <SightingContext.Provider value={{sightings, addSighting}}>
            {children}
        </SightingContext.Provider>
    );
};

export const useSightings = () => {
    const context = useContext(SightingContext);
    if(!context) {
        throw new Error("doesn't work")
    }
    return context;
}