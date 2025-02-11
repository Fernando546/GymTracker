import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dialog, Button, useTheme } from 'react-native-paper';

export default function CustomAlert({
  visible,
  title,
  message,
  onDismiss,
  buttons,
}: {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  buttons: Array<{ text: string; onPress: () => void }>;
}) {
  const theme = useTheme();
  
  return (
    <Dialog 
      visible={visible} 
      onDismiss={onDismiss}
      style={styles.dialog}
    >
      <Dialog.Title style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Dialog.Title>
      <Dialog.Content>
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>
          {message}
        </Text>
      </Dialog.Content>
      <Dialog.Actions style={styles.actions}>
        {buttons.map((btn, index) => (
          <Button
            key={index}
            onPress={btn.onPress}
            textColor="#7C4DFF"
            style={styles.button}
          >
            {btn.text}
          </Button>
        ))}
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#121212',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  button: {
    marginLeft: 16,
  },
}); 