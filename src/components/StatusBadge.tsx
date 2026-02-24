import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppointmentStatus } from '../types/models';

const colors: Record<AppointmentStatus, string> = {
  MARCADO: '#2563eb',
  CONCLUIDO: '#16a34a',
  FALTOU: '#ea580c',
  CANCELADO: '#dc2626',
};

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <View style={[styles.badge, { borderColor: colors[status] }]}>
      <Text style={[styles.text, { color: colors[status] }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
