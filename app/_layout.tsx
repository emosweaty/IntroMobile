import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SightingsProvider } from './SightingContext';

export default function RootLayout() {
  return (
    <SightingsProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'orange',
          headerStyle: {backgroundColor: 'red'},
          headerTintColor: 'white'
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ size }) => <MaterialCommunityIcons name="home" color='red' size={size} />
          }}
          />

          <Tabs.Screen
            name='sightingsList'
            options={{
              title: "Sightings List",
              tabBarIcon: ({size}) => <MaterialCommunityIcons name='ufo-outline' color='red' size={size}/>
            }}
            />

          <Tabs.Screen
            name='[sighting]'
            options={{
              href: null
            }}
            />
      </Tabs>
    </SightingsProvider>
  )
}
