// src/components/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Button = ({ title, onPress, loading = false, variant = 'primary', style }) => {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.btn, isPrimary ? styles.primary : styles.outline, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : '#16A34A'} />
        : <Text style={[styles.text, !isPrimary && styles.outlineText]}>{title}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  primary: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: '#16A34A',
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineText: { color: '#16A34A' },
});

export default Button;