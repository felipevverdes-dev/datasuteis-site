export function scheduleWhenIdle(
  callback: () => void,
  options?: {
    timeout?: number;
    fallbackDelay?: number;
  }
) {
  if (typeof window === "undefined") {
    callback();
    return () => undefined;
  }

  const timeout = options?.timeout ?? 1200;
  const fallbackDelay = options?.fallbackDelay ?? 180;
  const pageWindow = window as Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof pageWindow.requestIdleCallback === "function") {
    const handle = pageWindow.requestIdleCallback(callback, { timeout });
    return () => pageWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, fallbackDelay);
  return () => window.clearTimeout(handle);
}
