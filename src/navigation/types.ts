/** Screens pushed on top of the Home tab (native slide + swipe-back). */
export type HomeStackParamList = {
  HomeMain: undefined;
  ProDetails: { proId: string; hideBooking?: boolean } | undefined;
  UrgentBooking: undefined;
};

/** Screens pushed on top of the Categories/Search tab. */
export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategoryDetails: { categoryId: string; categoryLabel: string };
  ProviderDetails: { providerId: string };
};

/** Screens pushed on top of the Bookings tab. */
export type BookingsStackParamList = {
  BookingsMain: undefined;
  ProDetails: { proId: string; hideBooking?: boolean } | undefined;
};

/** A pro's own thread — one conversation per (user, pro) pair in Firestore. */
export type ChatParams = {
  conversationId: string;
  providerName: string;
  providerImageUrl: string;
};

/** Screens pushed on top of the Messages tab. */
export type MessagesStackParamList = {
  MessagesMain: undefined;
};

/** The 5 bottom tabs — each is its own native stack, even where that stack is one screen deep. */
export type RootTabParamList = {
  Home: undefined;
  Categories: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

/**
 * Root native stack wrapping the drawer and full-screen pushed flows (Chat,
 * Auth, Help, Contact, Appearance). Gives them native iOS slide-from-right
 * animation and interactive edge swipe-back.
 */
export type RootStackParamList = {
  Main: undefined;
  Help: undefined;
  Contact: undefined;
  Appearance: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Chat: ChatParams;
};

/** The side Drawer wrapping the 5-tab app. */
export type RootDrawerParamList = {
  DrawerMain: undefined;
};

