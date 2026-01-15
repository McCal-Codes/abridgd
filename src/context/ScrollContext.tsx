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

  return (
    <ScrollContext.Provider value={{ scrollY: scrollYRef.current }}>
      {children}
    </ScrollContext.Provider>
  );
};

export default ScrollContext;
