import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Bookmark } from "lucide-react-native";
import { ThemeColors, useThemeOptional } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface Props {
  saved: boolean;
  title: string;
  onPress: () => void;
}

/** 44pt save toggle shared by the Home rows, the list cards and the detail sheet. */
export const SaveEventButton: React.FC<Props> = ({ saved, title, onPress }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${title} from saved events` : `Save ${title}`}
      accessibilityState={{ selected: saved }}
      hitSlop={4}
    >
      <Bookmark
        size={22}
        color={saved ? colors.tintStrong : colors.textSecondary}
        fill={saved ? colors.tintStrong : "none"}
      />
    </Pressable>
  );
};

const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    button: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  });
