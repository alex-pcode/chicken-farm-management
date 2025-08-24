import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  resetOnExecute?: boolean;
}

interface UseAsyncReturn<T, Args extends unknown[] = unknown[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
  cancel: () => void;
}

type AsyncFunction<T, Args extends unknown[] = unknown[]> = (...args: Args) => Promise<T>;

export const useAsync = <T, Args extends unknown[] = unknown[]>(
  asyncFunction: AsyncFunction<T, Args>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> => {
  const {
    immediate = false,
    onSuccess,
    onError,
    resetOnExecute = true
  } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true
  });

  const cancelRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      isIdle: true
    });
  }, []);

  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current.abort();
      cancelRef.current = null;
    }
  }, []);

  // Execute async function
  const execute = useCallback(async (...args: Args): Promise<T> => {
    // Cancel any ongoing request
    cancel();

    // Reset state if requested
    if (resetOnExecute) {
      reset();
    }

    // Create new abort controller
    cancelRef.current = new AbortController();

    // Set loading state
    setState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      isSuccess: false,
      isIdle: false,
      error: null
    }));

    try {
      // Execute the async function
      const data = await asyncFunction(...args);

      // Check if component is still mounted and request wasn't cancelled
      if (!mountedRef.current || cancelRef.current?.signal.aborted) {
        throw new Error('Request was cancelled');
      }

      // Set success state
      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null
      }));

      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }

      return data;

    } catch (error) {
      const asyncError = error instanceof Error ? error : new Error('Unknown error occurred');

      // Don't update state if component unmounted or request was cancelled
      if (!mountedRef.current) {
        throw asyncError;
      }

      // Only update state if it's not a cancellation error
      if (!cancelRef.current?.signal.aborted) {
        setState(prev => ({
          ...prev,
          error: asyncError,
          isLoading: false,
          isSuccess: false,
          isError: true
        }));

        // Call error callback
        if (onError) {
          onError(asyncError);
        }
      }

      throw asyncError;
    } finally {
      // Clear the cancel ref
      cancelRef.current = null;
    }
  }, [asyncFunction, resetOnExecute, reset, cancel, onSuccess, onError]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [immediate, execute]); // Only run on mount when immediate is true

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  return useMemo(() => ({
    ...state,
    execute,
    reset,
    cancel
  }), [state, execute, reset, cancel]);
};

// Hook for handling async operations with retry functionality
export const useAsyncRetry = <T, Args extends unknown[] = unknown[]>(
  asyncFunction: AsyncFunction<T, Args>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) => {
  const [retryCount, setRetryCount] = useState(0);
  
  const executeWithRetry = useCallback(async (...args: Args): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        const result = await asyncFunction(...args);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError!;
  }, [asyncFunction, maxRetries, retryDelay]);

  const asyncState = useAsync(executeWithRetry);
  
  return {
    ...asyncState,
    retryCount,
    maxRetries
  };
};

// Hook for handling multiple async operations
export const useAsyncQueue = <T>() => {
  const [queue, setQueue] = useState<Array<{ id: string; promise: Promise<T>; status: 'pending' | 'resolved' | 'rejected' }>>([]);
  
  const addToQueue = useCallback((id: string, asyncFn: () => Promise<T>) => {
    const promise = asyncFn();
    
    setQueue(prev => [...prev, { id, promise, status: 'pending' }]);
    
    promise
      .then(() => {
        setQueue(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'resolved' } : item
        ));
      })
      .catch(() => {
        setQueue(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'rejected' } : item
        ));
      });
    
    return promise;
  }, []);
  
  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);
  
  const queueStatus = useMemo(() => {
    const pending = queue.filter(item => item.status === 'pending').length;
    const resolved = queue.filter(item => item.status === 'resolved').length;
    const rejected = queue.filter(item => item.status === 'rejected').length;
    
    return {
      total: queue.length,
      pending,
      resolved,
      rejected,
      isComplete: pending === 0 && queue.length > 0
    };
  }, [queue]);
  
  return {
    queue,
    queueStatus,
    addToQueue,
    removeFromQueue,
    clearQueue
  };
};