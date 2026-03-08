import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../../theme/tokens';

export const SetupInstructionsSection = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>SETUP INSTRUCTIONS</Text>
      <Text style={styles.instructionText}>
        To enable Google Tasks/Calendar sync:
      </Text>
      <Text style={styles.instructionStep}>
        1. Create a Firebase project at console.firebase.google.com
      </Text>
      <Text style={styles.instructionStep}>
        2. Add Android app with package ID: com.adhdcaddi
      </Text>
      <Text style={styles.instructionStep}>
        3. Download google-services.json to android/app/
      </Text>
      <Text style={styles.instructionStep}>
        4. Enable Google Tasks API in Google Cloud Console
      </Text>
      <Text style={styles.instructionStep}>
        5. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID environment variable
      </Text>
      <Text style={styles.instructionStep}>6. Rebuild the app</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Tokens.spacing[6],
  },
  sectionTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: Tokens.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: Tokens.spacing[2],
  },
  instructionText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: 13,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[2],
    lineHeight: 20,
  },
  instructionStep: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 11,
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    paddingLeft: Tokens.spacing[2],
    lineHeight: 18,
  },
});
