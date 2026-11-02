import type { IpcData, IpcStateBridge } from "@electron-spark/ipc";
import { subscribeIpcState } from "@electron-spark/ipc/renderer";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

export const useIpcState = <const T extends IpcData, const S>(
  ipcState: IpcStateBridge<T>,
  extract: (state: T) => S,
) => {
  const [value, setValue] = useState<S>();

  const [failed, setFailed] = useState(false);

  const retryRef = useRef<() => void>(() => {});
  const retry = useCallback(() => retryRef.current(), []);

  const update = useEffectEvent((state: T) => {
    const newValue = extract(state);
    if (value !== newValue) {
      setValue(newValue);
    }
    if (failed) {
      setFailed(false);
    }
  });

  useEffect(() => {
    const subscription = subscribeIpcState({
      source: ipcState,
      update,
      onError: () => setFailed(true),
    });
    retryRef.current = subscription.retry;
    return () => subscription.dispose();
  }, []);

  return useMemo(() => ({ value, failed, retry }), [value, failed, retry]);
};
