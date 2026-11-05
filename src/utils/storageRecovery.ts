import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Why a persisted value could not be read.
 * - `transient`: the storage read itself kept failing; the stored data may be perfectly fine.
 * - `unsupported-version`: the data was written by a schema this build does not understand
 *   (for example after an app downgrade). It must not be overwritten.
 */
export type StorageReadFailure = "transient" | "unsupported-version";

/**
 * Thrown when stored data exists but could not be loaded. Callers must treat this as
 * "do not write back": the previous implementation returned an empty value instead, and the
 * context's autosave then replaced the user's real data with it.
 */
export class StorageReadError extends Error {
  readonly reason: StorageReadFailure;

  constructor(reason: StorageReadFailure, message: string) {
    super(message);
    this.name = "StorageReadError";
    this.reason = reason;
  }
}

export const getBackupKey = (storageKey: string): string => `${storageKey}.bak`;

/**
 * Keep a copy of a value we are about to give up on, so a bad migration or a corrupt write
 * is recoverable by hand. Best effort: a failure here must never block the app.
 */
export const backupRawValue = async (storageKey: string, raw: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(getBackupKey(storageKey), raw);
  } catch (error) {
    console.warn("Could not back up unreadable storage value:", error);
  }
};
