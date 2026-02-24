import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/database';
import { RootStackParamList } from './src/types/navigation';
import AgendaScreen from './src/screens/AgendaScreen';
import AppointmentFormScreen from './src/screens/AppointmentFormScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ClientDetailScreen from './src/screens/ClientDetailScreen';
import ServicesScreen from './src/screens/ServicesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      setReady(true);
    };

    setup();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Agendamento' }} />
        <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Clientes' }} />
        <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detalhe do Cliente' }} />
        <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Serviços' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
