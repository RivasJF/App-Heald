import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

export default function DoctorLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <FontAwesome name="user-md" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="estatus"
        options={{
          title: "Estatus",
          tabBarIcon: ({ color, size }) => <FontAwesome name="tachometer" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mis-citas"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => <FontAwesome name="list-alt" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}