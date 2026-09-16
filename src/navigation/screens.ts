/**
 * Central registry of route names. Every navigator/navigate() call below
 * reads from here instead of repeating string literals, so renaming a
 * screen is a one-line change instead of a project-wide find-replace.
 */
export const SCREENS = {
  // Drawer (src/navigation/RootNavigator.tsx)
  MAIN: 'Main',
  HELP: 'Help',
  CONTACT: 'Contact',
  // Tabs (src/navigation/MainTabs.native.tsx / .web.tsx)
  HOME: 'Home',
  CATEGORIES: 'Categories',
  BOOKINGS: 'Bookings',
  MESSAGES: 'Messages',
  PROFILE: 'Profile',
  // Home stack (pushed on top of the Home tab)
  HOME_MAIN: 'HomeMain',
  PRO_DETAILS: 'ProDetails',
  // Categories stack (pushed on top of the Categories/Search tab)
  CATEGORIES_MAIN: 'CategoriesMain',
  CATEGORY_DETAILS: 'CategoryDetails',
  PROVIDER_DETAILS: 'ProviderDetails',
} as const;
