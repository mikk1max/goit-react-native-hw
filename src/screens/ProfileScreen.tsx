import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/routers';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { AuthUser } from '@/api/auth';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { GlassSurface } from '@/components/GlassSurface';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { navigateToRootScreen, navigateToSignIn } from '@/navigation/navigationRef';
import { SCREENS } from '@/navigation/screens';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { updateUserProfile } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, shadows, spacing, typography } from '@/theme';

const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const;

function ProfileForm({ user }: { user: AuthUser }) {
  const dispatch = useAppDispatch();
  const { colors: themeColors } = useTheme();

  const [firstName, setFirstName] = useState(
    user.firstName ?? (user.name ? user.name.split(' ')[0] : ''),
  );
  const [surname, setSurname] = useState(
    user.surname ?? (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
  );
  const [gender, setGender] = useState(user.gender ?? '');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const currentFirst = user.firstName ?? (user.name ? user.name.split(' ')[0] : '');
  const currentSur = user.surname ?? (user.name ? user.name.split(' ').slice(1).join(' ') : '');
  const currentGen = user.gender ?? '';

  const hasChanged =
    firstName.trim() !== currentFirst ||
    surname.trim() !== currentSur ||
    gender !== currentGen;

  const fullName = [firstName.trim(), surname.trim()].filter(Boolean).join(' ');
  const canSave = hasChanged && fullName.length >= 2;

  const saveProfile = async () => {
    if (!canSave) return;
    setSavingProfile(true);
    try {
      await dispatch(
        updateUserProfile({
          firstName: firstName.trim(),
          surname: surname.trim(),
          gender: gender || undefined,
        }),
      ).unwrap();
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(60).duration(280)}>
        <TextField
          label="Name"
          value={firstName}
          onChangeText={setFirstName}
          autoComplete="given-name"
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(280)}>
        <TextField
          label="Surname"
          value={surname}
          onChangeText={setSurname}
          autoComplete="family-name"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(280)} style={styles.genderSection}>
        <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
          Gender (optional)
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select gender"
          onPress={() => setShowGenderModal(true)}
        >
          <GlassSurface
            style={[
              styles.selectorInput,
              {
                borderColor: themeColors.borderLight,
                backgroundColor: themeColors.surface,
              },
            ]}
            isInteractive
          >
            <Text
              style={[
                typography.bodyM,
                {
                  color: gender ? themeColors.textPrimary : themeColors.textPlaceholder,
                },
              ]}
            >
              {gender || 'Select gender'}
            </Text>
            <Ionicons name="chevron-expand" size={16} color={themeColors.textMuted} />
          </GlassSurface>
        </Pressable>
      </Animated.View>

      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowGenderModal(false)}>
          <Pressable style={styles.modalCardWrapper} onPress={(e) => e.stopPropagation()}>
            <GlassSurface
              style={[
                styles.modalCard,
                {
                  borderColor: themeColors.borderLight,
                  backgroundColor: themeColors.white,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[typography.h4, { color: themeColors.textPrimary }]}>
                  Gender
                </Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowGenderModal(false)}
                  style={styles.modalCloseButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={20} color={themeColors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.optionsList}>
                {GENDER_OPTIONS.map((option, index) => {
                  const isSelected = gender === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      onPress={() => {
                        setGender(option);
                        setShowGenderModal(false);
                      }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        index < GENDER_OPTIONS.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: themeColors.borderLight,
                        },
                        pressed && { backgroundColor: themeColors.surfaceMedium },
                      ]}
                    >
                      <Text
                        style={[
                          typography.bodyM,
                          {
                            color: isSelected ? themeColors.primary : themeColors.textPrimary,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {option}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={20} color={themeColors.primary} />
                      ) : null}
                    </Pressable>
                  );
                })}

                {gender ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setGender('');
                      setShowGenderModal(false);
                    }}
                    style={({ pressed }) => [
                      styles.clearRow,
                      {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: themeColors.borderLight,
                      },
                      pressed && { backgroundColor: themeColors.surfaceMedium },
                    ]}
                  >
                    <Text style={[typography.bodyM, { color: themeColors.urgent }]}>
                      Clear selection
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </GlassSurface>
          </Pressable>
        </Pressable>
      </Modal>

      <Animated.View entering={FadeInDown.delay(240).duration(280)}>
        <Button
          title="Save"
          onPress={saveProfile}
          disabled={!canSave}
          loading={savingProfile}
          fullWidth={false}
        />
      </Animated.View>
    </View>
  );
}

/**
 * MVP profile — a real account's own name/surname/gender, email,
 * and navigation to auth flows for guests. Sign out is in the Drawer menu.
 */
export function ProfileScreen() {
  const navigation = useNavigation();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const { status, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerClearance, paddingBottom: bottomClearance + spacing.xl },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(280)} style={styles.header}>
          <Avatar size="lg" />
          <Text style={[typography.h1, { color: themeColors.textPrimary }]}>
            {isAuthenticated ? user!.name : 'Guest'}
          </Text>
          {isAuthenticated ? (
            <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>{user!.email}</Text>
          ) : (
            <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
              Sign in to book pros, message them, and manage your bookings.
            </Text>
          )}
        </Animated.View>

        {isAuthenticated ? (
          <ProfileForm key={user!.id} user={user!} />
        ) : (
          <Animated.View entering={FadeInDown.delay(80).duration(280)} style={styles.section}>
            <Button title="Sign in" onPress={navigateToSignIn} />
            <Button
              title="Create an account"
              variant="secondary"
              onPress={() => navigateToRootScreen(SCREENS.SIGN_UP)}
            />
          </Animated.View>
        )}
      </ScrollView>

      <Header title="Profile" onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  section: {
    gap: spacing.md,
  },
  genderSection: {
    gap: spacing.xxs,
  },
  selectorInput: {
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCardWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  modalCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.raised,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  modalCloseButton: {
    padding: spacing.xxs,
  },
  optionsList: {
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  clearRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
});
