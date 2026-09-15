import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable, type GlassStyle } from 'expo-glass-effect';
import { Platform, StyleSheet, type ViewProps } from 'react-native';

export type GlassSurfaceProps = ViewProps & {
  /** iOS 26 Liquid Glass variant — ignored on the BlurView fallback. */
  glassEffectStyle?: GlassStyle;
  tintColor?: string;
  /** Lets the glass "squish" on press, like Apple's own buttons — ignored on the fallback. */
  isInteractive?: boolean;
};

// Some iOS 26 betas ship without the native API (expo/expo#40911) — never let
// a decorative wrapper crash the app over it.
function checkLiquidGlassSupport() {
  try {
    return Platform.OS === 'ios' && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

const supportsLiquidGlass = checkLiquidGlassSupport();

/**
 * Renders real Liquid Glass on iOS 26+, a blurred surface everywhere else
 * (older iOS, Android, web) — same call site either way.
 */
export function GlassSurface({
  glassEffectStyle = 'regular',
  tintColor,
  isInteractive,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  if (supportsLiquidGlass) {
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={isInteractive}
        style={style}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView intensity={50} tint="light" style={[styles.blurFallback, style]} {...rest}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurFallback: {
    overflow: 'hidden',
  },
});
