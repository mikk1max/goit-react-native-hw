import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export type AvatarSize = 'sm' | 'lg';

export type AvatarProps = {
  /** Remote photo — falls back to a placeholder person icon when omitted. */
  imageUrl?: string;
  size?: AvatarSize;
  /** Background tint behind the placeholder icon or under a transparent PNG. */
  backgroundColor?: string;
};

const DIMENSIONS: Record<AvatarSize, number> = {
  sm: 40,
  lg: 80,
};

/** Figma's Avatar component always uses a 0.4 corner-radius-to-size ratio (a "squircle"), not a circle. */
const CORNER_RATIO = 0.4;

export function Avatar({ imageUrl, size = 'sm', backgroundColor }: AvatarProps) {
  const { colors: themeColors } = useTheme();
  const dimension = DIMENSIONS[size];
  const borderRadius = dimension * CORNER_RATIO;

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor: backgroundColor ?? themeColors.primaryLightest,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { borderRadius }]}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="person" size={dimension * 0.55} color={themeColors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
