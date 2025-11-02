// lib/animations/motiAnimations.ts
import { MotiTransition, MotiProps } from 'moti';

// shared transition curve for consistency
export const defaultTransition: MotiTransition = {
  type: 'timing',
  duration: 300,
  easing: (t) => 1 - Math.pow(1 - t, 3), // smooth ease-out cubic
};

// ========== COMMON ANIMATION CONFIGS ==========

// Fade in/out
export const fadeIn = (): Partial<MotiProps> => ({
  from: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: defaultTransition,
});

// Scale bounce
export const bounceScale = (): Partial<MotiProps> => ({
  from: { scale: 0.8 },
  animate: { scale: 1 },
  transition: {
    type: 'spring',
    damping: 10,
    stiffness: 150,
  },
});

// Rotate slightly
export const rotate = (deg: number = 10): Partial<MotiProps> => ({
  from: { rotate: '0deg' },
  animate: { rotate: `${deg}deg` },
  transition: defaultTransition,
});

// Slide in from bottom
export const slideUp = (offset: number = 40): Partial<MotiProps> => ({
  from: { translateY: offset, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  exit: { translateY: offset, opacity: 0 },
  transition: defaultTransition,
});

// Slide in from sides
export const slideFromLeft = (offset: number = -50): Partial<MotiProps> => ({
  from: { translateX: offset, opacity: 0 },
  animate: { translateX: 0, opacity: 1 },
  exit: { translateX: offset, opacity: 0 },
  transition: defaultTransition,
});

export const slideFromRight = (offset: number = 50): Partial<MotiProps> => ({
  from: { translateX: offset, opacity: 0 },
  animate: { translateX: 0, opacity: 1 },
  exit: { translateX: offset, opacity: 0 },
  transition: defaultTransition,
});

// Press feedback (like a scale tap)
export const pressableScale = (pressed: boolean): Partial<MotiProps> => ({
  animate: {
    scale: pressed ? 0.95 : 1,
  },
  transition: {
    type: 'timing',
    duration: 120,
  },
});
