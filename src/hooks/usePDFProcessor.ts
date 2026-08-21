import { useState, useCallback } from 'react';
import { ProcessingState } from '../types/toolTypes';

export function usePDFProcessor() {
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
    error: undefined,
  });

  const startProcessing = useCallback((initialMessage = 'Processing document...') => {
    setState({
      status: 'processing',
      progress: 10,
      message: initialMessage,
      error: undefined,
    });
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState((prev) => ({
      ...prev,
      progress,
      message: message || prev.message,
    }));
  }, []);

  const setSuccess = useCallback((message = 'Document processed successfully!') => {
    setState({
      status: 'success',
      progress: 100,
      message,
      error: undefined,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState({
      status: 'error',
      progress: 0,
      message: 'An error occurred during processing.',
      error,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      message: '',
      error: undefined,
    });
  }, []);

  return {
    state,
    startProcessing,
    updateProgress,
    setSuccess,
    setError,
    reset,
  };
}
