import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { message: string };

export default function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  text: {
    color: '#6b7280',
  },
});
