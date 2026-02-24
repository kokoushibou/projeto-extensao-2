import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { addDays, todayIso } from '../utils/date';
import { appointmentsRepo } from '../db/repos/appointmentsRepo';
import { AppointmentListItem, AppointmentStatus } from '../types/models';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'Agenda'>;

export default function AgendaScreen({ navigation, route }: Props) {
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState<AppointmentListItem[]>([]);

  const load = useCallback(async () => {
    setItems(await appointmentsRepo.listByDate(date));
  }, [date]);

  useEffect(() => {
    load();
  }, [load, route.params?.refreshAt]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => navigation.navigate('Clients')}>
            <Text style={styles.link}>Clientes</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Services')}>
            <Text style={styles.link}>Serviços</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const setStatus = async (id: number, status: AppointmentStatus) => {
    await appointmentsRepo.updateStatus(id, status);
    load();
  };

  const renderItem = ({ item }: { item: AppointmentListItem }) => (
    <View style={styles.card}>
      <View style={styles.rowSpace}>
        <Text style={styles.time}>{item.startTime}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.title}>{item.clientName}</Text>
      <Text style={styles.subtitle}>{item.serviceName}</Text>
      <View style={styles.actions}>
        {(['CONCLUIDO', 'FALTOU', 'CANCELADO'] as AppointmentStatus[]).map((status) => (
          <Pressable key={status} style={styles.actionBtn} onPress={() => setStatus(item.id, status)}>
            <Text style={styles.actionText}>{status}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.editBtn} onPress={() => navigation.navigate('AppointmentForm', { appointmentId: item.id })}>
          <Text>Editar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <Pressable onPress={() => setDate(addDays(date, -1))}><Text>◀</Text></Pressable>
        <Pressable onPress={() => setDate(todayIso())}><Text style={{ fontWeight: '700' }}>{date}</Text></Pressable>
        <Pressable onPress={() => setDate(addDays(date, 1))}><Text>▶</Text></Pressable>
      </View>

      <Pressable style={styles.newBtn} onPress={() => navigation.navigate('AppointmentForm')}>
        <Text style={styles.newBtnText}>+ Novo agendamento</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState message="Sem agendamentos para este dia" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f3f4f6' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  newBtn: { backgroundColor: '#111827', padding: 12, borderRadius: 10, marginBottom: 10 },
  newBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontWeight: '800', fontSize: 18 },
  title: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  subtitle: { color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#eef2ff', borderRadius: 8 },
  actionText: { fontSize: 12 },
  editBtn: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#e5e7eb', borderRadius: 8 },
  link: { color: '#2563eb', fontWeight: '600' },
});
