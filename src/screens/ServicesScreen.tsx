import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { servicesRepo } from '../db/repos/servicesRepo';
import { Service } from '../types/models';
import EmptyState from '../components/EmptyState';
import ListItemCard from '../components/ListItemCard';

export default function ServicesScreen() {
  const [list, setList] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');

  const load = async () => setList(await servicesRepo.list());
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Validação', 'Nome obrigatório');
      return;
    }
    if ((Number(durationMin) || 0) <= 0) {
      Alert.alert('Validação', 'Duração deve ser maior que 0');
      return;
    }

    const payload = {
      name: name.trim(),
      durationMin: Number(durationMin),
      defaultPrice: defaultPrice ? Number(defaultPrice) : null,
    };

    if (editing) {
      await servicesRepo.update(editing.id, payload);
    } else {
      await servicesRepo.create(payload);
    }

    setEditing(null); setName(''); setDurationMin(''); setDefaultPrice('');
    load();
  };

  const edit = (svc: Service) => {
    setEditing(svc);
    setName(svc.name);
    setDurationMin(String(svc.durationMin));
    setDefaultPrice(svc.defaultPrice ? String(svc.defaultPrice) : '');
  };

  const remove = (id: number) => Alert.alert('Excluir', 'Deseja excluir este serviço?', [
    { text: 'Cancelar' },
    { text: 'Excluir', style: 'destructive', onPress: async () => { await servicesRepo.remove(id); load(); } },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{editing ? 'Editar Serviço' : 'Novo Serviço'}</Text>
        <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Duração (min)" value={durationMin} onChangeText={setDurationMin} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Preço padrão" value={defaultPrice} onChangeText={setDefaultPrice} keyboardType="decimal-pad" />
        <Pressable style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>{editing ? 'Atualizar' : 'Criar'}</Text></Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Nenhum serviço cadastrado" />}
        renderItem={({ item }) => (
          <View>
            <ListItemCard title={item.name} subtitle={`${item.durationMin} min`} rightText={item.defaultPrice ? `R$ ${item.defaultPrice}` : '-'} onPress={() => edit(item)} />
            <View style={styles.row}><Pressable style={styles.smallBtn} onPress={() => remove(item.id)}><Text>Excluir</Text></Pressable></View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f3f4f6' },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 10 },
  formTitle: { fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 8 },
  saveBtn: { backgroundColor: '#111827', padding: 10, borderRadius: 8 },
  saveText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  smallBtn: { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});
