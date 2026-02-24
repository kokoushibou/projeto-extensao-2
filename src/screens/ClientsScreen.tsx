import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { clientsRepo } from '../db/repos/clientsRepo';
import { Client } from '../types/models';
import EmptyState from '../components/EmptyState';
import ListItemCard from '../components/ListItemCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Clients'>;

export default function ClientsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => setList(await clientsRepo.list(search));

  useEffect(() => { load(); }, [search]);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Validação', 'Nome é obrigatório');
      return;
    }
    if (editing) {
      await clientsRepo.update(editing.id, { name: name.trim(), phone, notes });
    } else {
      await clientsRepo.create({ name: name.trim(), phone, notes });
    }
    setEditing(null); setName(''); setPhone(''); setNotes('');
    load();
  };

  const edit = (c: Client) => {
    setEditing(c); setName(c.name); setPhone(c.phone ?? ''); setNotes(c.notes ?? '');
  };

  const remove = (id: number) => Alert.alert('Excluir', 'Deseja excluir este cliente?', [
    { text: 'Cancelar' },
    { text: 'Excluir', style: 'destructive', onPress: async () => { await clientsRepo.remove(id); load(); } },
  ]);

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Buscar por nome/telefone" value={search} onChangeText={setSearch} />

      <View style={styles.form}>
        <Text style={styles.formTitle}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
        <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Telefone" value={phone} onChangeText={setPhone} />
        <TextInput style={[styles.input, { height: 70 }]} placeholder="Observações" value={notes} onChangeText={setNotes} multiline />
        <Pressable style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>{editing ? 'Atualizar' : 'Criar'}</Text></Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Nenhum cliente encontrado" />}
        renderItem={({ item }) => (
          <View>
            <ListItemCard
              title={item.name}
              subtitle={item.phone || 'Sem telefone'}
              onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
            />
            <View style={styles.row}>
              <Pressable style={styles.smallBtn} onPress={() => edit(item)}><Text>Editar</Text></Pressable>
              <Pressable style={styles.smallBtn} onPress={() => remove(item.id)}><Text>Excluir</Text></Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f3f4f6' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 8 },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 10 },
  formTitle: { fontWeight: '700', marginBottom: 8 },
  saveBtn: { backgroundColor: '#111827', padding: 10, borderRadius: 8 },
  saveText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  smallBtn: { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});
