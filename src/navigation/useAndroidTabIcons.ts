import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { SCREENS } from './screens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
/** The rasterized `{uri, width, height, scale}` Ionicons.getImageSource resolves to. */
export type ResolvedTabIcon = NonNullable<Awaited<ReturnType<typeof Ionicons.getImageSource>>>;

const ICON_SIZE = 24;

/** Keyed the same as MainTabs' tab route names. */
export const TAB_ANDROID_ICON_NAMES: Record<string, IconName> = {
  [SCREENS.HOME]: 'home',
  [SCREENS.CATEGORIES]: 'search',
  [SCREENS.BOOKINGS]: 'calendar',
  [SCREENS.MESSAGES]: 'chatbubble',
  [SCREENS.PROFILE]: 'person',
};

/**
 * The native tab bar takes SF Symbols on iOS, but Android has no such thing —
 * it needs an actual raster image, tinted natively for the active/inactive
 * state. Ionicons.getImageSource rasterizes a glyph once; this resolves every
 * tab's icon up front so `tabBarIcon` never has to await anything mid-render.
 * Resolves to `null` on iOS, where it isn't needed at all.
 */
export function useAndroidTabIcons(
  icons: Record<string, IconName>,
  color: string,
): Record<string, ResolvedTabIcon> | null {
  const [resolved, setResolved] = useState<Record<string, ResolvedTabIcon> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        Object.entries(icons).map(async ([key, name]) => {
          const source = await Ionicons.getImageSource(name, ICON_SIZE, color);
          return [key, source] as const;
        }),
      );
      if (!cancelled) {
        const resolvedEntries = entries.filter(
          (entry): entry is [string, ResolvedTabIcon] => entry[1] !== null,
        );
        setResolved(Object.fromEntries(resolvedEntries));
      }
    })();

    return () => {
      cancelled = true;
    };
    // `icons` is a fresh object every render by design (inline literal at the call site);
    // it's keyed/valued the same every time, so re-resolving on identity change is wasted work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  return resolved;
}
