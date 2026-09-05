import React from 'react';
import { Animated } from 'react-native';

type ScrollContextValue = {
  scrollY: Animated.Value;
};

const defaultVal: ScrollContextValue = {
  // default placeholder; provider will replace
  scrollY: new Animated.Value(0),
};

export const ScrollContext = React.createContext<ScrollContextValue>(defaultVal);

export const ScrollProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const scrollYRef = React.useRef<Animated.Value>(new Animated.Value(0));
  // The Animated.Value is stable in a ref, but the object wrapping it was rebuilt on every
  // provider render, which is a new context value for every consumer each time.
  const value = React.useMemo(() => ({ scrollY: scrollYRef.current }), []);

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
};

export default ScrollContext;
