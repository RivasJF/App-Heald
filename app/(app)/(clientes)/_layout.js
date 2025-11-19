import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      {/* <Tabs.Screen name="citas" options={{ title: "Citas" }} /> */}
      {/* <Tabs.Screen name="perfil" options={{ title: "Perfil" }} /> */}
    </Tabs>
  );
}
