import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { clientsRepo } from '../db/repos/clientsRepo';
import { appointmentsRepo } from '../db/repos/appointmentsRepo';
import { Client, ClientHistoryItem } from '../types/models';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientDetail'>;

export default function ClientDetailScreen({ route }: Props) {
  const { clientId } = route.params;
  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<ClientHistoryItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setClient(await clientsRepo.getById(clientId));
      setHistory(await appointmentsRepo.listByClient(clientId));
    };
    load();
  }, [clientId]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{client?.name}</Text>
        <Text>Telefone: {client?.phone || '-'}</Text>
        <Text>Observações: {client?.notes || '-'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Histórico</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Cliente sem histórico" />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.date} {item.startTime} - {item.serviceName}</Text>
            <Text>Valor: {item.price ? `R$ ${item.price}` : '-'}</Text>
            <StatusBadge status={item.status} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f3f4f6' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  item: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, gap: 5 },
  itemTitle: { fontWeight: '700' },
});
