import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const AbridgedReader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Abridged Mode</Text>
      <Text style={styles.description}>
        This is a placeholder for the future RSVP (Rapid Serial Visual Presentation) reader.
      </Text>
      <View style={styles.featuresContainer}>
        <Text style={styles.noteLabel}>Planned Features:</Text>
        <Text style={styles.note}>• Speed control slider</Text>
        <Text style={styles.note}>• Word-by-word display</Text>
        <Text style={styles.note}>• Attentional blink optimization</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 0,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  title: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.sans,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.sans,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  noteLabel: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.sans,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  note: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.sans,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});
