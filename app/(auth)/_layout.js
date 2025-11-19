import { Slot, Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="login" options={{ title: "Panel" }} />
    </ Tabs>
  );
}