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
import { clearAuthFormError, loginUser } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography } from '@/theme';

/** Pushed on RootStack with native iOS slide-from-right animation and edge swipe-back. */
export function SignInScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const headerClearance = useFloatingHeaderClearance();
  const { colors: themeColors } = useTheme();
  const dispatch = useAppDispatch();
  const { formPending, formError, status } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signing in returns to the previous screen or Main tabs underneath
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

  const canSubmit = email.trim().length > 0 && password.length > 0 && !formPending;

  const submit = () => {
    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: themeColors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { paddingTop: headerClearance }]}>
          <Text style={[typography.h1, { color: themeColors.textPrimary }]}>Welcome back</Text>
          <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
            Sign in to book pros, message them, and see your own bookings.
          </Text>

          <View style={styles.form}>
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
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
            />

            {formError ? (
              <Text style={[typography.bodyS, { color: themeColors.urgent }]}>{formError}</Text>
            ) : null}

            <Button title="Sign in" onPress={submit} disabled={!canSubmit} loading={formPending} />
          </View>

          <Button
            title="Create an account"
            variant="secondary"
            onPress={() => navigation.navigate(SCREENS.SIGN_UP)}
          />
        </View>
      </ScrollView>

      <Header
        title="Sign in"
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
