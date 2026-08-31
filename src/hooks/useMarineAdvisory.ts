import { useState } from 'react';
import { fetchMarineAdvisory } from '../lib/api';
import type { AdvisoryRequest, MarineAdvisoryResponse } from '../lib/api';

export function useMarineAdvisory() {
  const [data, setData] = useState<MarineAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvisory = async (params: AdvisoryRequest): Promise<MarineAdvisoryResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMarineAdvisory(params);
      setData(result);
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch marine advisory';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    getAdvisory,
  };
}