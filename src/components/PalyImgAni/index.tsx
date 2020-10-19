import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { FarmFacade } from '../../supports/FarmFacade';

interface Props {
    path: string;
    start: number;
    end: number;
    classname?: string;
    autoPlay?: boolean;
    completeHandler?: () => void;
    imgType?: string;
    /** 播放速率 */
    speed?: number;
    play?: boolean;
    /** 延迟播放 单位秒 */
    delay?: number;
}

/** 
 * 播放图片序列动画
 */

export const PlayImgAni: FunctionComponent<Props> = ({
    path,
    start,
    end,
    classname,
    autoPlay,
    completeHandler,
    imgType,
    speed,
    play,
    delay,
}) => {
    const aniRef = useRef<HTMLImageElement>(null);
    // const getImg = FarmFacade.inst.getAssetsURL;

    const [imgurl, setimgurl] = useState(
        FarmFacade.inst.getAssetsURL(`${path}${start}.${imgType || 'png'}`),
    );
    const timer = useRef<ReturnType<typeof setTimeout>>();

    const [autoplay] = useState(autoPlay === undefined ? true : autoPlay);

    const clearTimer = useCallback(() => {
        if (timer.current) {
            // console.log("关闭timer======");
            clearInterval(timer.current);
            timer.current = undefined;
        }
    }, []);

    const playAni = useCallback(() => {
        if (!aniRef.current) return;
        clearTimer();

        let indexs = start;
        timer.current = setInterval(() => {
            if (indexs >= end) {
                setimgurl(FarmFacade.inst.getAssetsURL(`${path}${indexs}.${imgType || 'png'}`));
                completeHandler?.();
                clearTimer();
                // console.log("播放完成,,");
                return;
            }
            indexs += 1;
            setimgurl(FarmFacade.inst.getAssetsURL(`${path}${indexs}.${imgType || 'png'}`));
        }, speed || 40);
    }, [clearTimer, completeHandler, end, imgType, path, speed, start]);

    useEffect(() => {
        if (delay && autoplay) {
            const timer1 = setTimeout(() => {
                playAni();
                clearTimeout(timer1);
            }, delay * 1000);
        } else if (autoplay) playAni();

        return () => {
            clearTimer();
        };
    }, [autoplay, clearTimer, delay, playAni]);

    useEffect(() => {
        if (play) {
            playAni();
        }
    }, [play, playAni]);

    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, [clearTimer]);

    return (
        <div className={classname}>
            <img ref={aniRef} src={imgurl} alt=""></img>
        </div>
    );
};
