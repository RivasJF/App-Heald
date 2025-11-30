import { Slot, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
