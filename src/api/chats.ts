import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { ApiError } from './client';
import { auth, db } from './firebase';

export type Conversation = {
  id: string;
  providerId: string;
  providerName: string;
  providerRole: string;
  providerImageUrl: string;
  lastMessageText: string;
  lastMessageAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: 'user' | 'provider';
  text: string;
  createdAt: string;
};

export type NewConversation = {
  providerId: string;
  providerName: string;
  providerRole: string;
  providerImageUrl: string;
};

const AUTO_REPLIES = [
  "Thanks for reaching out — I'll get back to you shortly.",
  'Got it, thanks! I can take a look this week.',
  "Sounds good — let's confirm the details closer to your booking.",
  'Appreciate the message, I’ll follow up soon.',
  'Thanks! Let me know if anything changes before then.',
];

function pickAutoReply(): string {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

export async function fetchConversations(
  _token: string,
): Promise<{ conversations: Conversation[] }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', uid),
  );
  const snap = await getDocs(q);

  const conversations: Conversation[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      providerId: data.providerId,
      providerName: data.providerName,
      providerRole: data.providerRole,
      providerImageUrl: data.providerImageUrl,
      lastMessageText: data.lastMessageText || '',
      lastMessageAt: data.lastMessageAt || '',
    };
  });

  conversations.sort((a, b) =>
    (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''),
  );

  return { conversations };
}

export async function startConversation(
  _token: string,
  provider: NewConversation,
): Promise<{ conversation: Conversation }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const { providerId, providerName, providerRole, providerImageUrl } =
    provider;
  if (!providerId || !providerName || !providerRole || !providerImageUrl) {
    throw new ApiError(400, 'Missing provider details.');
  }

  const conversationId = `${uid}_${providerId}`;
  const convRef = doc(db, 'conversations', conversationId);
  const snap = await getDoc(convRef);

  if (!snap.exists()) {
    const newConv = {
      userId: uid,
      providerId,
      providerName,
      providerRole,
      providerImageUrl,
      lastMessageText: '',
      lastMessageAt: new Date().toISOString(),
    };
    await setDoc(convRef, newConv);
    return {
      conversation: {
        id: conversationId,
        ...newConv,
      },
    };
  }

  const data = snap.data();
  return {
    conversation: {
      id: conversationId,
      providerId: data.providerId,
      providerName: data.providerName,
      providerRole: data.providerRole,
      providerImageUrl: data.providerImageUrl,
      lastMessageText: data.lastMessageText || '',
      lastMessageAt: data.lastMessageAt || '',
    },
  };
}

export async function fetchMessages(
  _token: string,
  conversationId: string,
): Promise<{ messages: ChatMessage[] }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists() || convSnap.data().userId !== uid) {
    throw new ApiError(404, 'Conversation not found.');
  }

  const msgsRef = collection(db, 'conversations', conversationId, 'messages');
  const snap = await getDocs(msgsRef);

  const messages: ChatMessage[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      conversationId: data.conversationId || conversationId,
      sender: data.sender,
      text: data.text,
      createdAt: data.createdAt,
    };
  });

  messages.sort((a, b) =>
    (a.createdAt || '').localeCompare(b.createdAt || ''),
  );

  return { messages };
}

export async function sendMessage(
  _token: string,
  conversationId: string,
  text: string,
): Promise<{ messages: ChatMessage[] }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new ApiError(400, 'Message cannot be empty.');
  }

  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists() || convSnap.data().userId !== uid) {
    throw new ApiError(404, 'Conversation not found.');
  }

  const userCreatedAt = new Date().toISOString();
  const msgsRef = collection(db, 'conversations', conversationId, 'messages');

  const userDocRef = await addDoc(msgsRef, {
    conversationId,
    sender: 'user',
    text: trimmedText,
    createdAt: userCreatedAt,
  });

  const userMessage: ChatMessage = {
    id: userDocRef.id,
    conversationId,
    sender: 'user',
    text: trimmedText,
    createdAt: userCreatedAt,
  };

  const replyText = pickAutoReply();
  const replyCreatedAt = new Date(Date.now() + 1000).toISOString();

  const proDocRef = await addDoc(msgsRef, {
    conversationId,
    sender: 'provider',
    text: replyText,
    createdAt: replyCreatedAt,
  });

  const providerMessage: ChatMessage = {
    id: proDocRef.id,
    conversationId,
    sender: 'provider',
    text: replyText,
    createdAt: replyCreatedAt,
  };

  await updateDoc(convRef, {
    lastMessageText: replyText,
    lastMessageAt: replyCreatedAt,
  });

  return {
    messages: [userMessage, providerMessage],
  };
}
