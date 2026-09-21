import Ionicons from '@expo/vector-icons/Ionicons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ChatMessage } from '@/api/chats';
import { Avatar } from '@/components/Avatar';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { SCREENS } from '@/navigation/screens';
import type { RootStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { fetchMessages, sendMessage } from '@/store/chatsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, spacing, typography } from '@/theme';

type ChatRoute = RouteProp<RootStackParamList, 'Chat'>;

function MessageBubble({ message }: { message: ChatMessage }) {
  const { colors: themeColors } = useTheme();
  const isMine = message.sender === 'user';
  return (
    <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
      <View
        style={[
          styles.bubble,
          isMine
            ? { backgroundColor: themeColors.primary, borderBottomRightRadius: radii.sm / 2 }
            : { backgroundColor: themeColors.surface, borderBottomLeftRadius: radii.sm / 2 },
        ]}
      >
        <Text
          style={[
            typography.bodyM,
            { color: isMine ? themeColors.white : themeColors.textPrimary },
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const EMPTY_MESSAGES: ChatMessage[] = [];

/** One pro's own thread — a real, persisted conversation in Firestore, with simulated auto-reply from the pro. */
export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRoute>();
  const { conversationId, providerName, providerImageUrl } = route.params;
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const dispatch = useAppDispatch();

  const messages = useAppSelector(
    (state) => state.chats.messagesByConversation[conversationId] ?? EMPTY_MESSAGES,
  );
  const status = useAppSelector(
    (state) => state.chats.messagesStatusByConversation[conversationId] ?? 'idle',
  );
  const sending = useAppSelector(
    (state) => state.chats.sendingByConversation[conversationId] ?? false,
  );

  const [draft, setDraft] = useState('');

  // FlatList's `inverted` renders index 0 at the bottom (newest-first) — the
  // API returns oldest-first, matching how they're stored and re-sent.
  const messagesNewestFirst = useMemo(() => [...messages].reverse(), [messages]);

  useEffect(() => {
    dispatch(fetchMessages(conversationId));
  }, [conversationId, dispatch]);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const submit = () => {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }
    setDraft('');
    dispatch(sendMessage({ conversationId, text }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: themeColors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {status === 'loading' && messages.length === 0 ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={messagesNewestFirst}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={[
            styles.list,
            { paddingBottom: headerClearance, paddingTop: spacing.sm },
          ]}
          renderItem={({ item }) => <MessageBubble message={item} />}
        />
      )}

      <Header
        title={providerName}
        onBackPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate(SCREENS.MAIN as never)
        }
        rightElement={<Avatar size="sm" imageUrl={providerImageUrl} />}
      />

      <View
        style={[
          styles.composer,
          {
            paddingBottom: (isKeyboardVisible ? 0 : bottomClearance) + spacing.xs,
            borderTopColor: themeColors.borderLight,
          },
        ]}
      >
        <View style={[styles.inputWrap, { backgroundColor: themeColors.surface }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message..."
            placeholderTextColor={themeColors.textPlaceholder}
            style={[styles.input, { color: themeColors.textPrimary }]}
            multiline
            onSubmitEditing={submit}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          hitSlop={8}
          disabled={!draft.trim() || sending}
          onPress={submit}
          style={[
            styles.sendButton,
            { backgroundColor: themeColors.primary },
            (!draft.trim() || sending) && styles.sendButtonDisabled,
          ]}
        >
          <Ionicons name="arrow-up" size={18} color={themeColors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: typography.bodyM.fontFamily,
    fontSize: typography.bodyM.fontSize,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
