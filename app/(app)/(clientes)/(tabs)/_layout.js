import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="crear-cita"
        options={{
          title: "Agendar",
          tabBarIcon: ({ color, size }) => <FontAwesome name="calendar-plus-o" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mis-citas"
        options={{
          title: "Mis Citas",
          tabBarIcon: ({ color, size }) => <FontAwesome name="list-alt" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil" // Esta será la pestaña central por defecto
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <FontAwesome name="user-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
