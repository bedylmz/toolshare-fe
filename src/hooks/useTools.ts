// src/hooks/useTools.ts
import { useState, useEffect } from 'react';
import { toolApi, Tool } from '../services/api';

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const data = await toolApi.getAll();
      setTools(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err. message : 'Aletler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTools = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const data = await toolApi.getAvailable(startDate, endDate);
      setTools(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müsait aletler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return { tools, loading, error, fetchTools, fetchAvailableTools };
}