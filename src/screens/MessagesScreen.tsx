import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/routers';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { navigateToChat, navigateToSignIn } from '@/navigation/navigationRef';
import type { MessagesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import type { Conversation } from '@/api/chats';
import { fetchConversations } from '@/store/chatsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, spacing, typography } from '@/theme';

/** "Just now" through a short date, without pulling in a date-formatting library for one label. */
function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const { colors: themeColors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? themeColors.surfaceMedium : themeColors.surface },
      ]}
    >
      <Avatar imageUrl={conversation.providerImageUrl} />
      <View style={styles.rowInfo}>
        <Text style={[typography.bodyM, { color: themeColors.textPrimary }]} numberOfLines={1}>
          {conversation.providerName}
        </Text>
        <Text style={[typography.bodyS, { color: themeColors.textMuted }]} numberOfLines={1}>
          {conversation.lastMessageText || conversation.providerRole}
        </Text>
      </View>
      <Text style={[typography.bodyXS, { color: themeColors.textPlaceholder }]}>
        {formatRelativeTime(conversation.lastMessageAt)}
      </Text>
    </Pressable>
  );
}

/** Threads with a pro — one per (user, pro) pair, started from that pro's own profile ("Message" button). Guests never reach past the sign-in prompt below. */
export function MessagesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const isAuthenticated = useAppSelector((state) => state.auth.status === 'authenticated');
  const { conversations, conversationsStatus, conversationsError } = useAppSelector(
    (state) => state.chats,
  );
  const dispatch = useAppDispatch();

  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <Ionicons name="chatbubble-outline" size={40} color={themeColors.textPlaceholder} />
          <Text style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}>
            Sign in to message your pros.
          </Text>
          <Button title="Sign in" fullWidth={false} onPress={navigateToSignIn} />
        </View>
        <Header
          title="Messages"
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      {conversationsStatus === 'loading' && conversations.length === 0 ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : conversationsStatus === 'error' ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <Text style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}>
            {conversationsError}
          </Text>
          <Button
            title="Try again"
            onPress={() => dispatch(fetchConversations())}
            fullWidth={false}
          />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.list,
            { paddingTop: headerClearance, paddingBottom: bottomClearance + spacing.xl },
          ]}
          data={conversations}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={[typography.bodyM, styles.empty, { color: themeColors.textMuted }]}>
              No messages yet — message a pro from their profile.
            </Text>
          }
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() =>
                navigateToChat({
                  conversationId: item.id,
                  providerName: item.providerName,
                  providerImageUrl: item.providerImageUrl,
                })
              }
            />
          )}
        />
      )}
      <Header
        title="Messages"
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  rowInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
});
