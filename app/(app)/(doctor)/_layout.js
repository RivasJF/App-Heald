import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Panel" }} />
      {/* <Tabs.Screen name="citas" options={{ title: "Citas" }} /> */}
      {/* <Tabs.Screen name="consultorio" options={{ title: "Consultorio" }} /> */}
    </Tabs>
  );
}
