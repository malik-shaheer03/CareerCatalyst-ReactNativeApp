import { Stack } from 'expo-router';

export default function DashboardsLayout() {
  return (
    <Stack>
      <Stack.Screen name="user-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="employer-dashboard" options={{ headerShown: false }} />
    </Stack>
  );
}
