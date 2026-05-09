import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from '../../../../src/context/ThemeContext';

export default function ClientTabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Aplicamos el tema a la barra inferior del paciente
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: Platform.OS === 'android' ? 90 : 88,
          paddingBottom: Platform.OS === 'android' ? 25 : 30,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtitle,
        tabBarHideOnKeyboard: true, // Evita que la barra suba cuando aparece el teclado
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="crear-cita"
        options={{
          title: 'Agendar',
          tabBarIcon: ({ color }) => <FontAwesome name="calendar-plus-o" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mis-citas"
        options={{
          title: 'Mis Citas',
          tabBarIcon: ({ color }) => <FontAwesome name="calendar-check-o" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}