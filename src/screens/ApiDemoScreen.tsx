import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
import { apiRequest } from "../shared/api/apiClient";
import { authService } from "../services/AuthService";

export default function ApiDemoScreen() {
  const [result, setResult] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // seed a token for demo
    authService.setToken({ accessToken: "demo-token", refreshToken: "refresh-token" });
  }, []);

  const fetchDemo = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await apiRequest("https://jsonplaceholder.typicode.com", "/posts/1", {}, { includeAuth: true });
      setResult(res);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Demo</Text>
      <Text style={styles.subtitle}>Demonstrates auth injection, retries, and error handling.</Text>
      <Button title="Fetch Post" onPress={fetchDemo} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {result && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Result:</Text>
          <Text>{JSON.stringify(result)}</Text>
        </View>
      )}
      {error && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold" },
  subtitle: { color: "#666", marginBottom: 12 },
});
