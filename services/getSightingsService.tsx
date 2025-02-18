import axios from "axios";

const getSightings = () => {
    return axios.get("https://sampleapis.assimilate.be/ufo/sightings")
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching sightings:", error);
            throw error;
        });
};

export default getSightings;
