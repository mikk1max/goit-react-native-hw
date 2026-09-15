/** Screens pushed on top of the Home tab (native slide + swipe-back). */
export type HomeStackParamList = {
  HomeMain: undefined;
  ProDetails: { proId: string } | undefined;
};

/** The 5 bottom tabs — each is its own native stack, even where that stack is one screen deep. */
export type RootTabParamList = {
  Home: undefined;
  Categories: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};
