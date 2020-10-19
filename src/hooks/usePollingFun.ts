import { useCallback, useEffect, useRef } from 'react';

/**
 *  轮询
 * @param tickFun 轮询方法
 */
export const usePollingFun = (tickFun: () => void): [() => void, () => void] => {
    const ticker = useRef<ReturnType<typeof setTimeout>>();

    const clearTimer = useCallback(() => {
        if (ticker.current) {
            clearInterval(ticker.current);
        }
        ticker.current = undefined;
    }, []);

    const onTicker = useCallback(() => {
        if (tickFun) tickFun();
    }, [tickFun]);

    const startRequest = useCallback(() => {
        if (!ticker.current) {
            ticker.current = setInterval(onTicker, 3000);
        }
    }, [onTicker]);

    const stopPolling = useCallback(() => {
        clearTimer();
    }, [clearTimer]);

    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, [clearTimer]);

    return [startRequest, stopPolling];
};
