import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// expo-secure-store has no web implementation. This app still ships a "web" config block
// (see app.json), so fall back to AsyncStorage there rather than throwing.
const isSecureStoreAvailable = Platform.OS !== "web";

export const getSecureValue = async (key: string): Promise<string | null> => {
  try {
    if (!isSecureStoreAvailable) {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.error(`Failed to read secure value for ${key}`, e);
    return null;
  }
};

export const setSecureValue = async (key: string, value: string): Promise<void> => {
  // Deliberately does not catch: callers (including the legacy-value migration below)
  // need to know a write actually failed rather than silently proceeding as if it saved.
  if (!value) {
    if (!isSecureStoreAvailable) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
    return;
  }

  if (!isSecureStoreAvailable) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

/**
 * One-time migration for values previously stored in plaintext AsyncStorage. Returns the
 * current value (migrated or already-secure), or null if none exists anywhere.
 */
export const migrateFromAsyncStorage = async (key: string): Promise<string | null> => {
  const existing = await getSecureValue(key);
  if (existing) return existing;

  try {
    const legacyValue = await AsyncStorage.getItem(key);
    if (!legacyValue) return null;

    await setSecureValue(key, legacyValue);
    await AsyncStorage.removeItem(key);
    return legacyValue;
  } catch (e) {
    console.error(`Failed to migrate legacy AsyncStorage value for ${key}`, e);
    return null;
  }
};
