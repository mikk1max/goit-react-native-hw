import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import * as chatsApi from '@/api/chats';
import type { ChatMessage, Conversation, NewConversation } from '@/api/chats';

import type { RootState } from './store';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type ChatsState = {
  conversations: Conversation[];
  conversationsStatus: LoadStatus;
  conversationsError: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  messagesStatusByConversation: Record<string, LoadStatus>;
  sendingByConversation: Record<string, boolean>;
};

const initialState: ChatsState = {
  conversations: [],
  conversationsStatus: 'idle',
  conversationsError: null,
  messagesByConversation: {},
  messagesStatusByConversation: {},
  sendingByConversation: {},
};

function requireToken(state: RootState): string {
  const token = state.auth.token;
  if (!token) {
    throw new Error('Not signed in.');
  }
  return token;
}

export const fetchConversations = createAsyncThunk<Conversation[], void, { state: RootState }>(
  'chats/fetchConversations',
  async (_arg, { getState }) => {
    const { conversations } = await chatsApi.fetchConversations(requireToken(getState()));
    return conversations;
  },
);

/** Get-or-create — used both from Messages (list) and from a pro's own profile ("Message" button). */
export const startConversation = createAsyncThunk<
  Conversation,
  NewConversation,
  { state: RootState }
>('chats/start', async (provider, { getState }) => {
  const { conversation } = await chatsApi.startConversation(requireToken(getState()), provider);
  return conversation;
});

export const fetchMessages = createAsyncThunk<
  { conversationId: string; messages: ChatMessage[] },
  string,
  { state: RootState }
>('chats/fetchMessages', async (conversationId, { getState }) => {
  const { messages } = await chatsApi.fetchMessages(requireToken(getState()), conversationId);
  return { conversationId, messages };
});

export const sendMessage = createAsyncThunk<
  { conversationId: string; messages: ChatMessage[] },
  { conversationId: string; text: string },
  { state: RootState }
>('chats/sendMessage', async ({ conversationId, text }, { getState }) => {
  const { messages } = await chatsApi.sendMessage(requireToken(getState()), conversationId, text);
  return { conversationId, messages };
});

function touchConversation(state: ChatsState, conversationId: string, lastMessage: ChatMessage) {
  const conversation = state.conversations.find((item) => item.id === conversationId);
  if (conversation) {
    conversation.lastMessageText = lastMessage.text;
    conversation.lastMessageAt = lastMessage.createdAt;
  }
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    resetChats: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = 'loading';
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.conversationsStatus = 'loaded';
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = 'error';
        state.conversationsError = action.error.message ?? 'Could not load your messages.';
      })
      .addCase(startConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
        const exists = state.conversations.some((item) => item.id === action.payload.id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(fetchMessages.pending, (state, action) => {
        state.messagesStatusByConversation[action.meta.arg] = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatusByConversation[action.payload.conversationId] = 'loaded';
        state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatusByConversation[action.meta.arg] = 'error';
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.sendingByConversation[action.meta.arg.conversationId] = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.sendingByConversation[conversationId] = false;
        const existing = state.messagesByConversation[conversationId] ?? [];
        state.messagesByConversation[conversationId] = [...existing, ...messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
          touchConversation(state, conversationId, lastMessage);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingByConversation[action.meta.arg.conversationId] = false;
      });
  },
});

export const { resetChats } = chatsSlice.actions;
export default chatsSlice.reducer;
