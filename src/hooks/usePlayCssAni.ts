import { useCallback, useEffect, useRef } from 'react';

export const usePlayCssAni = () => {
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = undefined;
        }
    }, []);

    /** 播放css动画
     * @param ele 需要播放动画的dom对象
     * @param anicls 动画css
     * @param autoClear 播完是否清除动画css,默认清除（如果需要循环播，就不要清除了）
     */
    const playAni = useCallback(
        (ele: HTMLElement, anicls: string, autoClear = true) => {
            if (ele) {
                ele.classList.add(anicls);
                if (autoClear) {
                    timerRef.current = setTimeout(() => {
                        if (ele) ele.classList.remove(anicls);
                    }, 1000);
                }
            }
            return () => {
                clearTimer();
            };
        },
        [clearTimer],
    );

    /**
     *  清除css动画
     */
    const clearAni = useCallback((ele: HTMLElement, anicls: string) => {
        if (ele) ele.classList.remove(anicls);
    }, []);

    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, [clearTimer]);

    return [playAni, clearAni];
};
