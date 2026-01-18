import React, { useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { GlassButton } from "../components/GlassButton";
import { NavigationHeader } from "../components/NavigationHeader";
import {
  BottomToolbar,
  ToolbarItem,
  ToolbarSpacer,
  ToolbarItemGroup,
} from "../components/BottomToolbar";
import { ZoomModal } from "../components/ZoomModal";
import { BlurSheet } from "../components/BlurSheet";
import {
  Info,
  Trash,
  Plus,
  Share,
  Pencil,
  Download,
  X,
  Check,
  ChevronLeft,
} from "lucide-react-native";

/**
 * Demo screen showcasing iOS 26-inspired UI components:
 * - Glass buttons with prominence styles
 * - Navigation header with subtitle
 * - Bottom toolbar with spacers and groups
 * - Zoom modal transition
 * - Blur sheet with dynamic transparency
 */
export const iOS26DemoScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showBlurSheet, setShowBlurSheet] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  const infoButtonRef = useRef<View>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Navigation Header with Back Button */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerBackBtn}>
            <GlassButton
              label="Back"
              icon={<ChevronLeft size={18} color={colors.text} />}
              onPress={() => navigation.goBack()}
              prominence="standard"
            />
          </View>
        </View>
        <NavigationHeader
          title="iOS 26 Features"
          subtitle="Glass buttons, toolbars, and transitions"
          titleAlign="left"
          large
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: showToolbar ? 120 : 40 }]}
      >
        {/* Glass Button Prominence Styles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Glass Button Styles</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Similar to SwiftUI toolbar buttons with glass material
          </Text>

          <View style={styles.buttonGroup}>
            <GlassButton
              label="Standard"
              icon={<Info size={20} color={colors.text} />}
              onPress={() => console.log("Standard pressed")}
              prominence="standard"
            />
            <GlassButton
              label="Tinted"
              icon={<Share size={20} color={colors.primary} />}
              onPress={() => console.log("Tinted pressed")}
              prominence="tinted"
            />
            <GlassButton
              label="Filled"
              icon={<Check size={20} color={colors.background} />}
              onPress={() => console.log("Filled pressed")}
              prominence="filled"
            />
            <GlassButton
              label="Destructive"
              icon={<Trash size={20} color={colors.error} />}
              onPress={() => console.log("Destructive pressed")}
              prominence="standard"
              destructive
            />
          </View>
        </View>

        {/* Zoom Modal Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Zoom Modal Transition</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Modal zooms from source button (matchGeometry effect)
          </Text>

          <View ref={infoButtonRef}>
            <GlassButton
              label="Open Info Modal"
              icon={<Info size={20} color={colors.text} />}
              onPress={() => setShowZoomModal(true)}
              prominence="tinted"
            />
          </View>
        </View>

        {/* Blur Sheet Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bottom Sheet with Blur</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Transparent at medium detent, opaque when expanded
          </Text>

          <GlassButton
            label="Open Sheet"
            icon={<Pencil size={20} color={colors.text} />}
            onPress={() => setShowBlurSheet(true)}
            prominence="standard"
          />
        </View>

        {/* Bottom Toolbar Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bottom Toolbar</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Glass buttons with fixed and flexible spacers
          </Text>

          <GlassButton
            label={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
            onPress={() => setShowToolbar(!showToolbar)}
            prominence="filled"
          />
        </View>
      </ScrollView>

      {/* Bottom Toolbar with Glass Buttons */}
      <BottomToolbar visible={showToolbar} blur>
        <ToolbarItem>
          <GlassButton
            label="Delete"
            icon={<Trash size={18} color={colors.error} />}
            onPress={() => console.log("Delete")}
            prominence="standard"
            destructive
          />
        </ToolbarItem>

        <ToolbarSpacer spacing="flexible" />

        <ToolbarItemGroup gap={12}>
          <GlassButton
            label="New"
            icon={<Plus size={18} color={colors.text} />}
            onPress={() => console.log("New")}
            prominence="standard"
          />
          <GlassButton
            label="Download"
            icon={<Download size={18} color={colors.text} />}
            onPress={() => console.log("Download")}
            prominence="standard"
          />
        </ToolbarItemGroup>
      </BottomToolbar>

      {/* Zoom Modal */}
      <ZoomModal
        visible={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        sourceRef={infoButtonRef}
        blur
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Information</Text>
            <GlassButton
              label="Close"
              icon={<X size={18} color={colors.text} />}
              onPress={() => setShowZoomModal(false)}
              prominence="standard"
            />
          </View>
          <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
            This modal zooms from the button that triggered it, similar to SwiftUI's
            .navigationTransition(.zoom) with .matchTransitionSource modifier.
          </Text>
          <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
            The animation uses react-native-reanimated for smooth spring physics.
          </Text>
        </View>
      </ZoomModal>

      {/* Blur Sheet */}
      <BlurSheet
        visible={showBlurSheet}
        onClose={() => setShowBlurSheet(false)}
        detents={["medium", "large"]}
        initialDetent="medium"
        blur
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Dynamic Blur Sheet</Text>
          <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
            This bottom sheet shows transparency at the medium detent and becomes opaque when
            expanded to full height.
          </Text>
          <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
            Drag up to expand or down to dismiss. Similar to iOS 26 sheet presentation detents with
            background blur.
          </Text>

          <View style={styles.sheetActions}>
            <GlassButton label="Done" onPress={() => setShowBlurSheet(false)} prominence="filled" />
          </View>
        </View>
      </BlurSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerBackBtn: {
    width: 96,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonGroup: {
    gap: 12,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 24,
    fontWeight: "700",
  },
  modalBody: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sheetContent: {
    paddingVertical: 20,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  sheetBody: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sheetActions: {
    marginTop: 24,
  },
});
