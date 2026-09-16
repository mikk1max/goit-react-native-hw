# FixIt — React Native Component Library

Cross-discipline assignment 3 turned the FixIt Figma design into real,
reusable React Native components with Expo + TypeScript. Cross-discipline
assignment 4 layered real navigation on top: a Drawer wrapping the tab bar,
and screens that actually pass and validate data between each other instead
of always showing the same hardcoded pro.

FixIt is a mobile app that connects users with trusted local pros —
plumber, electrician, cleaner, painter, carpenter, gardener — for a
scheduled or urgent home-service booking.

**Figma:** [Shepeta_cross_assignments](https://www.figma.com/design/MJK386ryDWY8bcejg00axx/Shepeta_cross_assignments)

- Page **"01 — Wireframe"** — Assignment 1 (project description, Home,
  Categories, Pro Details, Checkout)
- Page **"02 — High-Fidelity UI"** — Assignment 2 (final colors, icons, the
  5-tab navigation structure this implementation follows)

## Screenshots

All taken on a real iOS 26 simulator build (`npm run ios`) — that's the
actual native tab bar and Liquid Glass chrome below, not a web mockup.

| Home                                      | Categories                                            | Pro profile                                             |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| ![Home](screenshots/01-home-portrait.png) | ![Categories](screenshots/02-categories-portrait.png) | ![Pro profile](screenshots/03-pro-details-portrait.png) |

**Landscape / tablet** (content reflows into a 2-column grid past 600dp):

Landscape:
![Landscape](screenshots/04-home-landscape.png)

Tablet:
![Tablet](screenshots/05-home-tablet.png)

Categories (tablet):
![Categories tablet](screenshots/06-categories-tablet.png)

Pro profile (tablet):
![Pro details tablet](screenshots/07-pro-details-tablet.png)

**Navigation** (Drawer menu, dynamic Pro profile, error handling — see
"Navigation" below):

Drawer open (swipe-from-edge or the ☰ button):
![Drawer open](screenshots/navigation/01-drawer-open.png)

Help & Support (a Drawer-only screen, no tab bar):
![Help screen](screenshots/navigation/02-help-screen.png)

Contact us:
![Contact screen](screenshots/navigation/03-contact-screen.png)

Sign out (an honest placeholder — there's no account in this app):
![Sign out alert](screenshots/navigation/04-sign-out-alert.png)

Pro profile for a different pro, reached via the same screen with a
different `proId` — the About/Pricing/Reviews are Anna's own, not Marek's:
![Pro details, Anna Kowalska](screenshots/navigation/05-pro-details-anna.png)

An invalid `proId` renders an explicit error state instead of crashing:
![Pro not found](screenshots/navigation/06-pro-not-found.png)

## Components

Each one lives in its own folder (`Component.tsx` + `index.ts`), styled with
`StyleSheet.create()` against shared theme tokens, and takes its content
through props — nothing is hardcoded per screen.

| Component      | Notes                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| `Button`       | primary/secondary variants, optional icon, loading state, optional `tintColor` override |
| `Header`       | back button + title + right slot, three independent floating Liquid Glass pieces        |
| `SearchBar`    | controlled `TextInput` with a search icon                                               |
| `Tag`          | selectable chip — category filters, time slots, optional trade icon                     |
| `CategoryList` | horizontal `FlatList` of `Tag`s                                                         |
| `ProCard`      | pro/review card — avatar, name, rating (the "product card")                             |
| `ListItem`     | generic row — category / pricing / summary lists, each with its own trade icon          |
| `TradeIcon`    | plumbing/electrical/cleaning/painting/carpentry/gardening pictograms, pulled from Figma |
| `StarRating`   | 0–5 rating, half-star aware                                                             |
| `Avatar`       | real photo via `Image`, Ionicons fallback when there's none                             |
| `GlassSurface` | Liquid Glass on iOS 26+, blurred elsewhere — shared by `Header` and the tab bar         |

Some notes on a few less obvious decisions:

- **`Pressable`, not `TouchableOpacity`**, for every tappable surface —
  `Pressable` is the current recommended component and is what
  `Button`/`ProCard`'s press states (`style={({ pressed }) => ...}`) actually
  need; `TouchableOpacity` doesn't support that.
- **The "Urgent request" card on Home uses its own accent color**
  (`colors.urgent` / `urgentLight`, `#FF5A3C` / `#FFE7E1`) instead of the
  brand blue used everywhere else — blue means "book calmly" throughout the
  rest of the app, so it shouldn't also mean "a pro arrives in 30 minutes."
- **Avatars use real (placeholder) photos**, not just an icon — `mockData.ts`
  points each pro/reviewer at a small illustrated avatar so `Image` actually
  renders content, not just a fallback glyph.
- **Category icons are real vector pictograms**, not a generic icon-font
  glyph reused six times — `TradeIcon` draws the actual plumbing/electrical/
  cleaning/painting/carpentry/gardening shapes from the Figma file, so each
  category chip and list row is visually distinct at a glance.
- **The second tab is labeled "Search"** even though the screen/route is
  still `Categories` internally — its first element is a search bar, so a
  magnifying-glass tab reads clearer than a generic grid icon would.

## Responsive layout

`useResponsiveLayout` (`src/hooks/useResponsiveLayout.ts`) uses
`useWindowDimensions` and reacts to **available width**, not device type — a
rotated phone gets the same treatment as a small tablet:

- **< 600dp** (phone portrait): content fills the screen, cards stack in a
  single column.
- **≥ 600dp** (tablet / landscape): the content column widens and repeating
  cards (`ProCard`, `ListItem`) reflow into a 2-column grid instead of
  stretching into one very wide row.

## Navigation

Three navigators, nested Drawer → Tab → Stack, each in its own file under
`src/navigation/`:

- **`RootNavigator.tsx`** — a `Drawer.Navigator` (`@react-navigation/drawer`)
  wrapping the whole app. `Main` is the 5-tab app below; `Help` and `Contact`
  are Drawer-only screens with no tab bar of their own. The Drawer's content
  is fully custom (`DrawerContent.tsx`) instead of the library's default
  list, so it matches the app's own colors/type/spacing. Swipe-from-the-left
  and the ☰ button on every root tab screen both open it.
- **`MainTabs.native.tsx`** / **`MainTabs.web.tsx`** — the 5 bottom tabs
  (Home, Search, Bookings, Messages, Profile). The bottom tab bar is the
  **actual native tab bar widget** (`react-native-bottom-tabs` +
  `@bottom-tabs/react-navigation`) — `UITabBarController` on iOS, which
  picks up iOS 26's Liquid Glass automatically (and its iPad-only top-bar
  layout — see `useTabBarLayout`), and Material 3 `BottomNavigation` on
  Android, rather than a JS view styled to look like one. Icons are
  platform-native too: real SF Symbols on iOS, rasterized Ionicons on
  Android. **This needs a development build — it does not run in Expo Go**,
  and has no web target (`MainTabs.web.tsx` is a plain JS bottom-tabs bar,
  used only to keep `npm run web` bundling for quick layout previews).
- **`HomeStackNavigator`** (inside `MainTabs.*.tsx`) — `@react-navigation/native-stack`,
  Home's own stack. Tapping a recommended pro pushes Pro profile with the
  platform's native transition and swipe-back gesture, passing
  `{ proId: pro.id }` through `navigation.navigate()`.

**Passing data between screens:** `ProDetailsScreen` reads `route.params.proId`
and looks the pro up in `recommendedPros` — it no longer just always renders
Marek Nowak. If `proId` is missing (a screen reached with no params) or
doesn't match any pro (a stale id), the screen renders an explicit "Pro not
found" state with a way back, instead of crashing on `pro.name`.

**Screen names are constants**, not scattered string literals — every
navigator and every `navigate()` call reads from `SCREENS` in
`src/navigation/screens.ts`.

**Gestures:** the Drawer's swipe-from-edge-to-open works everywhere, and
swipe-to-close works while it's open. On Pro profile specifically, that same
left edge is also where native-stack's own swipe-back gesture lives; the
Drawer currently wins that conflict, so Pro profile's reliable "go back" is
its Header's back button rather than an edge swipe (see the comment on
`RootNavigator.tsx`'s `Main` screen for why the usual fix — disabling the
Drawer's swipe while a nested screen is focused — doesn't take effect here).

**Dependency note:** `react-native-gesture-handler` is pinned to `^3.3.0`
instead of Expo SDK 57's default `~2.32.0` (see `expo.install.exclude` in
`package.json`). The older version and `react-native-reanimated`'s new
Worklets runtime don't agree on how gesture callbacks cross the JS/UI-thread
boundary — every tap inside the Drawer threw a "tried to synchronously call
a Remote Function" error under 2.32.0. Bumping to 3.x fixed it outright.

## Liquid Glass

`GlassSurface` renders real Liquid Glass via `expo-glass-effect` on iOS 26+,
falling back to `expo-blur`'s `BlurView` everywhere else — same call site,
no branching needed at the usage site. `Header` uses it as three independent
floating pieces (back button, title, right slot) rather than one shared
background, matching how iOS nav bars typically separate these elements.

## Running the project

```bash
npm install
npm run ios         # or: npm run android — builds & installs a dev client
npm run ios:device  # same, with a device picker
npm start           # subsequent runs
npm run lint
npm run typecheck
npm run format
npm run web          # layout/component preview only — no native tab bar
```

**Important:** because of the native tab bar, this project needs a real
development build (`npm run ios` / `npm run android`), not Expo Go. Opening
it in Expo Go fails with `Unimplemented component: <RNCTabView>`, since that
native module isn't part of the standard Expo Go binary.

## Project structure

```
App.tsx
src/
  theme/        colors, typography, spacing, shadows
  components/    Avatar/ Button/ Tag/ StarRating/ Header/
                 SearchBar/ ListItem/ ProCard/ CategoryList/ GlassSurface/
                 TradeIcon/
  hooks/         useResponsiveLayout.ts
  navigation/    RootNavigator (Drawer), MainTabs (native/web), screens.ts,
                 DrawerContent, tab bar height/icon helpers
  screens/       HomeScreen, CategoriesScreen, ProDetailsScreen,
                 HelpScreen, ContactScreen, PlaceholderScreen
  data/          mockData.ts
screenshots/
```

## What's not built yet

Out of scope for this assignment:

- `TextField`, `TextArea`, `Checkbox` and the Checkout/booking screen
- A real category-detail screen (`CategoriesScreen`'s rows are currently a
  no-op)
- A real Bookings/Messages/Profile — those tabs are placeholders
  (`PlaceholderScreen`), and Profile's own tabs (order history, settings)
  from the assignment brief's example aren't built
- Real data fetching (`data/mockData.ts` is static)
- Tests, form validation for the booking flow
