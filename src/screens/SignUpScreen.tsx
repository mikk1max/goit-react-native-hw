import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { SCREENS } from '@/navigation/screens';
import type { RootStackParamList } from '@/navigation/types';
import { clearAuthFormError, registerUser } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography } from '@/theme';

/** Pushed on RootStack with native iOS slide-from-right animation and edge swipe-back. */
export function SignUpScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const headerClearance = useFloatingHeaderClearance();
  const { colors: themeColors } = useTheme();
  const dispatch = useAppDispatch();
  const { formPending, formError, status } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate(SCREENS.MAIN);
      }
    }
  }, [status, navigation]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthFormError());
    };
  }, [dispatch]);

  const canSubmit =
    name.trim().length > 1 && email.trim().length > 0 && password.length >= 6 && !formPending;

  const submit = () => {
    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match.");
      return;
    }
    setConfirmError(null);
    dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: themeColors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { paddingTop: headerClearance }]}>
          <Text style={[typography.h1, { color: themeColors.textPrimary }]}>
            Create your account
          </Text>
          <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
            Takes a minute — then you can book pros and message them directly.
          </Text>

          <View style={styles.form}>
            <TextField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoComplete="name"
              textContentType="name"
            />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmError(null);
              }}
              placeholder="Type it again"
              secureTextEntry
              autoCapitalize="none"
              error={confirmError}
            />

            {formError ? (
              <Text style={[typography.bodyS, { color: themeColors.urgent }]}>{formError}</Text>
            ) : null}

            <Button
              title="Create account"
              onPress={submit}
              disabled={!canSubmit}
              loading={formPending}
            />
          </View>

          <Button
            title="I already have an account"
            variant="secondary"
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate(SCREENS.SIGN_IN)
            }
          />
        </View>
      </ScrollView>

      <Header
        title="Create account"
        onBackPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate(SCREENS.MAIN)
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
});
