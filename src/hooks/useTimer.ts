import { useCallback, useEffect, useRef } from 'react';

type TimerType = {
    timerOnce: (fun: () => void, delay: number) => ReturnType<typeof setTimeout>;
    timerLoop: (fun: () => void, delay: number, runCount?: number) => ReturnType<typeof setTimeout>;
    clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
    clearTimerAll: () => void;
};

export const useTimer = (): TimerType => {
    const timerList = useRef<ReturnType<typeof setTimeout>[]>([]);

    const delTimer = useCallback(
        (timerID) => {
            if (timerID) {
                clearTimeout(timerID);
                clearInterval(timerID);

                const timerIndex = timerList.current.indexOf(timerID);
                if (timerIndex >= 0) {
                    timerList.current.splice(timerIndex, 1);
                }
                // console.log('清除单个timer=====', timerID);
            }
        },
        [timerList],
    );

    const clearTimer = useCallback(
        (timerID) => {
            delTimer(timerID);
        },
        [delTimer],
    );

    const clearTimerAll = useCallback(() => {
        while (timerList.current.length) {
            const timer = timerList.current.shift();
            clearTimeout(timer);
            clearInterval(timer);
            // console.log('清除所有timer=====', timer);
        }
        timerList.current.length = 0;
    }, [timerList]);

    const timerOnce = (method: () => void, delay: number): ReturnType<typeof setTimeout> => {
        const timer = setTimeout(() => {
            method();
            clearTimer(timer);
        }, delay);

        timerList.current.push(timer);
        return timer;
    };

    const timerLoop = (
        method: () => void,
        delay: number,
        runCount?: number,
    ): ReturnType<typeof setTimeout> => {
        const timer = setInterval(() => {
            method();
            if (runCount) {
                runCount -= 1;
                if (runCount <= 0) {
                    clearTimer(timer);
                }
            }
        }, delay);
        timerList.current.push(timer);
        return timer;
    };

    useEffect(() => {
        return () => {
            clearTimerAll();
        };
    }, [clearTimerAll]);

    return { timerOnce, timerLoop, clearTimer, clearTimerAll };
};
