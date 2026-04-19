import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F9FAFB' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen
          name="create-reminder"
          options={{
            title: 'Create Nudge',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
      </Stack>
    </>
  );
}
