import axios from "axios";
import { useEffect, useState } from "react";

interface Sighting {
    id: number
    witnessName: string;
    location: {
        latitude: number;
        longitude: number;
    }
    description?: string;
    status?: string;
  
  }

  const getSightings = async (): Promise<Sighting[]> => {
    try {
      const response = await axios.get("https://sampleapis.assimilate.be/ufo/sightings");
      return response.data;
    } catch (error) {
      console.error("Error fetching sightings:", error);
      return [];
    }
  };
  const useSightings = () => {
    const [sightings, setSightings] = useState<Sighting[]>([]);
  
    useEffect(() => {
      const fetchData = async () => {
        const data = await getSightings();
        setSightings(data);
      };
  
      fetchData();
    }, []);
    const [, forceRender] = useState(0);
    const addSighting = (newSighting: Sighting) => {
        setSightings((prev) => {
            const updatedSightings = [...prev, newSighting];
            return updatedSightings;
        });
        forceRender((prev) => prev + 1);
    };
  
    return { sightings, addSighting };
  };
  
  export { useSightings, Sighting };