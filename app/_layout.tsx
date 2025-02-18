import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RootLayout() {
  return (
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />
          }}
          />

          <Tabs.Screen
            name='sightingsList'
            options={{
              title: "Sightings List",
              tabBarIcon: ({color, size}) => <MaterialCommunityIcons name='ufo-outline' color={color} size={size}/>
            }}
          />

          <Tabs.Screen
            name='[sighting]'
            options={{
              href: null
            }}
          />
      </Tabs>
  )
}
