/** Screens pushed on top of the Home tab (native slide + swipe-back). */
export type HomeStackParamList = {
  HomeMain: undefined;
  ProDetails: { proId: string } | undefined;
  UrgentBooking: undefined;
};

/** Screens pushed on top of the Categories/Search tab. */
export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategoryDetails: { categoryId: string; categoryLabel: string };
  ProviderDetails: { providerId: string };
};

/** The 5 bottom tabs — each is its own native stack, even where that stack is one screen deep. */
export type RootTabParamList = {
  Home: undefined;
  Categories: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

/** The side Drawer wrapping the whole tab bar — Main is the 5-tab app, Help/Contact/Appearance are drawer-only screens. */
export type RootDrawerParamList = {
  Main: undefined;
  Help: undefined;
  Contact: undefined;
  Appearance: undefined;
};
