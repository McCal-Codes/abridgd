import { useEffect, useRef, useState } from "react";
import { request, RequestOptions } from "../api/httpClient";

export type UseApiResult<T> = {
  data?: T;
  error?: Error;
  loading: boolean;
  refetch: () => void;
};

export function useApi<T = unknown>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const refetchIndex = useRef(0);

  const fetchData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await request<T>(baseUrl, path, options);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, path, refetchIndex.current]);

  return {
    data,
    error,
    loading,
    refetch: () => {
      refetchIndex.current += 1;
      // trigger effect manually by updating ref
      fetchData();
    },
  };
}
