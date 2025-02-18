"use dom"

import { MapContainer, Marker, Popup, SVGOverlay, TileLayer, useMap, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from "leaflet";
import { View, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "expo-router";
import getSightings from "@/services/getSightingsService";

const position: LatLngTuple = [51.505, -0.09];

interface PointOfInterest {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
let number=0;

let POINTS_OF_INTEREST : PointOfInterest[] = [];

/*const POINTS_OF_INTEREST : PointOfInterest[] = [
    {
      name: "AP Hogeschool",
      location: {
        latitude: 51.2243,
        longitude: 4.3852
      },
    },
    {
      name: "London Bridge",
      location: {
        latitude: 51.5055,
        longitude: -0.0754
      }
    },
    {
      name: "Eiffel Tower",
      location: {
        latitude: 48.8584,
        longitude: 2.2945
      }
    },
    {
      name: "Statue of Liberty",
      location: {
        latitude: 40.6892,
        longitude: -74.0445
      }
    }
];*/

interface LocationHandlerProps {
  addMarker: (lat: number, lng: number) => void;
}
const LocationHandler = ({addMarker} : LocationHandlerProps) => {
  const map = useMapEvents({
    dragend: () => {
      console.log(map.getCenter());
    },
    click: (e) => {
      addMarker(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

const Index = () => {

  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>(POINTS_OF_INTEREST);

  const iconX = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/similonap/public_icons/refs/heads/main/location-pin.png',
    iconSize: [48, 48],
    popupAnchor: [-3, 0],
  });

  async function loadMarkersFromApi() {
    //let list = await axios.get("https://sampleapis.assimilate.be/ufo/sightings"); 
    let data = await getSightings();// await list.data;
    setPointsOfInterest((prevPoints) => {
      return [
        ...prevPoints,
        ...data.map((e: any) => ({
          id: e.id || 0,
          name: e.witnessName || "New Point",
          location: { latitude: e.location.latitude, longitude: e.location.longitude },
        })),
      ];
    });
  }
  
  const addPointOfInterest = (lat: number, lng: number, id?: number, name?: string) => {
    if(name==null) name="New Point";
    if(id==null) id=0;
    setPointsOfInterest([...pointsOfInterest, {id: id, name: name, location: {latitude: lat, longitude: lng}}]);
  }

  if(number==0) {
    loadMarkersFromApi();
    number++;
  }

  return (
    <MapContainer
      center={{ lat: 51.505, lng: -0.09 }}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      attributionControl={false}
    >

      <TileLayer
        //attribution='&copy; <a href="https://www.openstreretmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationHandler addMarker={(lat, lng) => addPointOfInterest(lat,lng)} />
      {pointsOfInterest.map((point, index) => (
        <Marker key={index} position={[point.location.latitude, point.location.longitude]} icon={iconX}>
          <Popup >
            <View style={{backgroundColor: 'white', padding: 10, width: 100}}>
              
              <Link href={{
                pathname: "/[sighting]",
                params: {sighting: `${point.id}`}
              }} asChild>
                <Pressable>
                  <Text style={{textDecorationLine: "underline"}}>{point.name}</Text>
                </Pressable>
              </Link>

             </View>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}

export default Index;