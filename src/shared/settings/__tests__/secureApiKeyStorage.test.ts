import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { getSecureValue, setSecureValue, migrateFromAsyncStorage } from "../secureApiKeyStorage";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("expo-secure-store");

const KEY = "testApiKey";

describe("secureApiKeyStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it("getSecureValue reads through SecureStore", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("secret");
    const value = await getSecureValue(KEY);
    expect(value).toBe("secret");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(KEY);
  });

  it("setSecureValue writes through SecureStore for a non-empty value", async () => {
    await setSecureValue(KEY, "secret");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(KEY, "secret");
  });

  it("setSecureValue deletes the key when given an empty value", async () => {
    await setSecureValue(KEY, "");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(KEY);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("migrateFromAsyncStorage returns the SecureStore value without touching AsyncStorage when already migrated", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("already-secure");

    const value = await migrateFromAsyncStorage(KEY);

    expect(value).toBe("already-secure");
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
  });

  it("migrateFromAsyncStorage moves a legacy plaintext value into SecureStore and clears AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("legacy-plaintext");

    const value = await migrateFromAsyncStorage(KEY);

    expect(value).toBe("legacy-plaintext");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(KEY, "legacy-plaintext");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(KEY);
  });

  it("migrateFromAsyncStorage returns null when neither store has a value", async () => {
    const value = await migrateFromAsyncStorage(KEY);
    expect(value).toBeNull();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
