import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1E1E2F",
        },
        headerTintColor: "#FFD700",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 40,
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "PredictX" }} />
    </Stack>
  );
}
