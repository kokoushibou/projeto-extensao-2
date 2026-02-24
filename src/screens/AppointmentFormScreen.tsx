import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { clientsRepo } from '../db/repos/clientsRepo';
import { servicesRepo } from '../db/repos/servicesRepo';
import { AppointmentStatus, Client, Service } from '../types/models';
import { appointmentsRepo } from '../db/repos/appointmentsRepo';
import { nowTime, todayIso } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentForm'>;

export default function AppointmentFormScreen({ route, navigation }: Props) {
  const appointmentId = route.params?.appointmentId;

  const [date, setDate] = useState(todayIso());
  const [startTime, setStartTime] = useState(nowTime());
  const [durationMin, setDurationMin] = useState('60');
  const [clientId, setClientId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('MARCADO');
  const [clientSearch, setClientSearch] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const loadRefs = async () => {
    setClients(await clientsRepo.list(clientSearch));
    setServices(await servicesRepo.list());
  };

  useEffect(() => {
    loadRefs();
  }, [clientSearch]);

  useEffect(() => {
    if (!appointmentId) return;
    const load = async () => {
      const data = await appointmentsRepo.getById(appointmentId);
      if (!data) return;
      setDate(data.date);
      setStartTime(data.startTime);
      setDurationMin(String(data.durationMin));
      setClientId(data.clientId);
      setServiceId(data.serviceId);
      setPrice(data.price ? String(data.price) : '');
      setNotes(data.notes ?? '');
      setStatus(data.status);
    };
    load();
  }, [appointmentId]);

  const onServicePick = (id: number) => {
    setServiceId(id);
    const svc = services.find((s) => s.id === id);
    if (svc) {
      setDurationMin(String(svc.durationMin));
      if (svc.defaultPrice) setPrice(String(svc.defaultPrice));
    }
  };

  const saveWithConfirmation = async () => {
    if (!date || !startTime || !clientId || !serviceId) {
      Alert.alert('Validação', 'Preencha data, hora, cliente e serviço.');
      return;
    }

    const conflict = await appointmentsRepo.checkConflict(date, startTime, appointmentId);

    const executeSave = async () => {
      const payload = {
        date,
        startTime,
        durationMin: Number(durationMin) || 1,
        clientId,
        serviceId,
        price: price ? Number(price) : null,
        status,
        notes,
      };

      if (appointmentId) {
        await appointmentsRepo.update(appointmentId, payload);
      } else {
        await appointmentsRepo.create(payload);
      }

      navigation.navigate('Agenda', { refreshAt: Date.now() });
    };

    if (conflict) {
      Alert.alert('Conflito de horário', 'Já existe agendamento na mesma data e hora. Deseja salvar mesmo assim?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salvar', onPress: () => executeSave() },
      ]);
      return;
    }

    await executeSave();
  };

  const createClientQuick = async () => {
    if (!clientSearch.trim()) {
      Alert.alert('Novo Cliente', 'Digite o nome no campo de busca para criar rapidamente.');
      return;
    }
    const id = await clientsRepo.create({ name: clientSearch.trim(), phone: '', notes: '' });
    await loadRefs();
    setClientId(Number(id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-01-31" />

      <Text style={styles.label}>Hora início (HH:mm)</Text>
      <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="09:00" />

      <Text style={styles.label}>Buscar cliente</Text>
      <TextInput style={styles.input} value={clientSearch} onChangeText={setClientSearch} placeholder="Nome ou telefone" />
      <Pressable style={styles.secondaryBtn} onPress={createClientQuick}>
        <Text>Novo Cliente</Text>
      </Pressable>
      <View style={styles.pickerWrap}>
        {clients.map((c) => (
          <Pressable key={c.id} style={[styles.option, clientId === c.id && styles.optionActive]} onPress={() => setClientId(c.id)}>
            <Text>{c.name} {c.phone ? `(${c.phone})` : ''}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Serviço</Text>
      <View style={styles.pickerWrap}>
        {services.map((s) => (
          <Pressable key={s.id} style={[styles.option, serviceId === s.id && styles.optionActive]} onPress={() => onServicePick(s.id)}>
            <Text>{s.name} - {s.durationMin} min</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Duração (min)</Text>
      <TextInput style={styles.input} value={durationMin} onChangeText={setDurationMin} keyboardType="number-pad" />

      <Text style={styles.label}>Valor (opcional)</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      <Text style={styles.label}>Status</Text>
      <View style={styles.row}>
        {(['MARCADO', 'CONCLUIDO', 'FALTOU', 'CANCELADO'] as AppointmentStatus[]).map((s) => (
          <Pressable key={s} style={[styles.option, status === s && styles.optionActive]} onPress={() => setStatus(s)}>
            <Text>{s}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Observações (opcional)</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} multiline />

      <Pressable style={styles.saveBtn} onPress={saveWithConfirmation}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Salvar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f9fafb' },
  label: { marginBottom: 6, marginTop: 10, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10 },
  pickerWrap: { gap: 8, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { padding: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db' },
  optionActive: { borderColor: '#2563eb', backgroundColor: '#dbeafe' },
  saveBtn: { backgroundColor: '#111827', padding: 12, borderRadius: 10, marginTop: 16 },
  secondaryBtn: { marginTop: 8, alignSelf: 'flex-start', padding: 8, backgroundColor: '#e5e7eb', borderRadius: 8 },
});
