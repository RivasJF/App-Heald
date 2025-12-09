import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

export default function DoctorLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="hoy"
        options={{
          title: "Hoy",
          tabBarIcon: ({ color, size }) => <FontAwesome name="calendar-check-o" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <FontAwesome name="user-md" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => <FontAwesome name="calendar" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}