import { createContext, useState , ReactNode, useEffect, useContext} from "react";
import axios from "axios";
export interface Sighting {
    id: number
    witnessName: string;
    location: {
        latitude: number;
        longitude: number;
    }
    description?: string;
    status?: string;
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
                const response = await axios.get("https://sampleapis.assimilate.be/ufo/sightings");
                await setSightings(response.data);
              } catch (error) {
                console.error("Error fetching sightings:", error);
              }
        }
        fetchSightings();
    }, []);
    const addSighting = (newSighting: Sighting) => {
        setSightings((prev) => [...prev, newSighting]) ;
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
        throw new Error("doestn work")
    }
    return context;
}