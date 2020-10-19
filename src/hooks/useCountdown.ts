import { useCallback, useEffect, useRef, useState } from 'react';

export interface CountdownFormatRetureValue {
    day: string;
    hour: string;
    minute: string;
    second: string;
    millisecond: string;
}

export interface CountdownOptions {
    // 更新频率
    intervalTime?: number;
    // 当前时间
    now?: number;
}

interface StateRef {
    intervalTimer: ReturnType<typeof setTimeout> | null;
}

/**
 *  倒计时
 * @param targetTime 
 * @param options 
 */
const useCountdown = (
    // 目标时间
    targetTime: number,
    // 可选参数
    options?: CountdownOptions,
): [number, () => void, (n: number) => void] => {
    const { intervalTime = 1000, now } = options || {};
    const [timeLeft, setTimeLeft] = useState(() => targetTime - (now || Date.now()));
    const stateRef = useRef<StateRef>({
        intervalTimer: null,
    });

    useEffect(() => {
        stateRef.current.intervalTimer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev - intervalTime <= 0) {
                    if (stateRef.current.intervalTimer) {
                        clearInterval(stateRef.current.intervalTimer);
                    }
                    return 0;
                }

                return prev - intervalTime;
            });
        }, intervalTime);
        return (): void => {
            if (stateRef.current.intervalTimer) {
                clearInterval(stateRef.current.intervalTimer);
                stateRef.current = {} as StateRef;
            }
        };
    }, [targetTime, intervalTime]);

    useEffect(() => {
        setTimeLeft(() => targetTime - (now || Date.now()));
    }, [targetTime, now]);

    // 停止
    const stopIntervalTimer = useCallback((): void => {
        if (stateRef.current.intervalTimer) {
            clearInterval(stateRef.current.intervalTimer);
            stateRef.current.intervalTimer = null;
        }
    }, []);

    // 设置一个新的时间
    const resetTimer = useCallback(
        (n: number) => {
            stopIntervalTimer();
            setTimeLeft(n);
            stateRef.current.intervalTimer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev - intervalTime <= 0) {
                        if (stateRef.current.intervalTimer) {
                            clearInterval(stateRef.current.intervalTimer);
                        }
                        return 0;
                    }

                    return prev - intervalTime;
                });
            }, intervalTime);
        },
        [intervalTime, stopIntervalTimer],
    );

    return [timeLeft, stopIntervalTimer, resetTimer];
};

export const fullZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const countdownFormat = (time: number, noFullZero = false): CountdownFormatRetureValue => {
    const newTime = Math.max(time, 0);
    let timestamp = newTime / 1000;
    const day = Math.floor(timestamp / 86400);
    timestamp %= 86400;
    const hour = Math.floor(timestamp / 3600);
    timestamp %= 3600;
    const minute = Math.floor(timestamp / 60);
    timestamp %= 60;
    const second = Math.floor(timestamp);
    const millisecond = Math.floor(newTime % 1000);

    if (noFullZero) {
        return {
            day: String(day),
            hour: String(hour),
            minute: String(minute),
            second: String(second),
            millisecond: String(millisecond),
        };
    }
    return {
        day: fullZero(day),
        hour: fullZero(hour),
        minute: fullZero(minute),
        second: fullZero(second),
        millisecond: fullZero(millisecond),
    };
};

export default useCountdown;
