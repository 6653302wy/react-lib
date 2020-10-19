import React, {
    FunctionComponent,
    ReactElement,
    useState,
    useCallback,
    ReactNode,
    useEffect,
    useRef,
    CSSProperties,
    forwardRef,
    useImperativeHandle,
} from 'react';
import styles from './index.css';
import WhiteLoading from '../../assets/component/scroll/loading-out-white.png';
import Loading from '../../assets/component/scroll/loading-out.png';
import LoadingSpin from '../../assets/component/scroll/loading-spin.svg';

interface ScrollProps {
    children?: ReactNode;
    onEndReached?: Function;
    enable?: boolean;
    enableRefresh?: boolean;
    onRefresh?: Function;
    complete?: boolean;
    isShowComplete?: boolean;
    completeStyle?: CSSProperties;
    useWindow?: boolean;
    completeText?: string;
    endRefreshOffset?: number;
    loadingWhiteImg?: boolean;
    onScrollEvent?: Function;
    scrollLoadingClass?: string;
}

export interface ScrollExportFunc {
    onBackToTop: () => void;
    setScrollTop: (scrollTop: number) => void;
}

const eventParams = { passive: false };
const Scroll: FunctionComponent<ScrollProps> = (props: ScrollProps, ref): ReactElement => {
    const {
        useWindow = false,
        enableRefresh = false,
        loadingWhiteImg = false,
        enable = true,
        complete = false,
        onEndReached,
        isShowComplete = true,
        completeText = '全部加载完成',
        completeStyle = undefined,
        endRefreshOffset = 20,
        onRefresh = null,
        onScrollEvent = null,
        scrollLoadingClass = '',
    } = props;
    const [rotate, setRotate] = useState(0);
    const [pullDownTop, setPullDownTop] = useState(0);
    const scrollEventTarget = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scrollElementTarget = useRef() as any;
    const scrollContainer = useRef<HTMLDivElement>(null);
    const pullLoading = useRef<HTMLImageElement>(null);
    const pullLoadingBox = useRef<HTMLDivElement>(null);
    const stateRef = useRef({
        isAddTouchEvent: false,
        lock: false,
        isLoading: false,
        isPullDownEnd: true,
        startY: 0,
        startX: 0,
        isAddDocEvent: false,
        pullOffset: -50,
        pullDownTop: 0,
    });

    // 得到滚动高度
    const onGetScrollTop = useCallback((element: HTMLDivElement): number => {
        if (element.toString() === '[object Window]') {
            return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
        }
        return element.scrollTop;
    }, []);

    // 得到元素内容高度
    const onGetScrollHeight = useCallback((element: HTMLDivElement): number => {
        if (element.toString() === '[object Window]') {
            return document.body.scrollHeight || document.documentElement.scrollHeight;
        }
        return element.scrollHeight;
    }, []);

    // 下拉刷新结束动画
    const onPullDownEnd = useCallback(
        (cb: Function | null): void => {
            const pullLoadingBoxElement = pullLoadingBox.current;
            const scrollContainerElement = scrollContainer.current;
            const pullLoadingElement = pullLoading.current;

            if (
                !pullLoadingElement ||
                !pullLoadingBoxElement ||
                !scrollContainerElement ||
                !enableRefresh
            ) {
                return;
            }

            pullLoadingBoxElement.style.transition = `200ms`;
            scrollContainerElement.style.transition = `200ms`;
            pullLoadingElement.className = '';
            setPullDownTop(0);
            stateRef.current.pullDownTop = 0;
            stateRef.current.isPullDownEnd = true;

            setTimeout(() => {
                pullLoadingBoxElement.style.transition = '';
                scrollContainerElement.style.transition = '';
                if (cb) {
                    cb();
                }
            }, 200);
        },
        [enableRefresh],
    );

    const onAddDocumentEvent = useCallback((): void => {
        const scrollTarget = scrollElementTarget.current;
        if (!scrollTarget) return;
        scrollTarget.classList.add('disabled');
        stateRef.current.isAddDocEvent = true;
    }, [scrollElementTarget]);

    const onRemoveDocumentEvent = useCallback((): void => {
        const scrollTarget = scrollElementTarget.current;
        if (!scrollTarget) return;
        scrollTarget.classList.remove('disabled');
        stateRef.current.isAddDocEvent = false;
    }, [scrollElementTarget]);

    // 下拉刷新-触摸开始
    const onTouchStart = useCallback((e): void => {
        if (!stateRef.current.isPullDownEnd) return;
        stateRef.current.startY = e.targetTouches[0].pageY;
        stateRef.current.startX = e.targetTouches[0].pageX;
    }, []);

    // 下拉刷新-触摸移动中
    const onTouchMove = useCallback(
        (e): void => {
            const scrollTarget = scrollElementTarget.current;

            if (!stateRef.current.isPullDownEnd || !scrollTarget) return;

            const scrollTop = onGetScrollTop(scrollTarget);
            if (stateRef.current.startY <= 1) {
                stateRef.current.startY = e.targetTouches[0].pageY;
            }

            const diff = e.targetTouches[0].pageY - stateRef.current.startY;

            if (diff > 0) {
                onAddDocumentEvent();
            }

            if (e.cancelable && scrollTop <= 0 && diff > 0) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }

            stateRef.current.pullDownTop = Math.max(diff, 0) ** 0.8;
            setPullDownTop(Math.max(diff, 0) ** 0.8);
            setRotate(diff ** 1.1);
        },
        [onAddDocumentEvent, onGetScrollTop, scrollElementTarget],
    );

    // 下拉刷新-触摸结束
    const onTouchEnd = useCallback((): void => {
        const pullLoadingElement = pullLoading.current;
        const scrollTarget = scrollElementTarget.current;

        if (!scrollTarget || !pullLoadingElement || !stateRef.current.isPullDownEnd) return;

        pullLoadingElement.className = styles.pullDownLoading;
        stateRef.current.startY = 0;
        stateRef.current.startX = 0;

        onRemoveDocumentEvent();
        stateRef.current.isPullDownEnd = false;

        if (stateRef.current.pullDownTop + stateRef.current.pullOffset <= endRefreshOffset) {
            onPullDownEnd(null);
        } else if (onRefresh) {
            onRefresh(onPullDownEnd);
        }
    }, [scrollElementTarget, onRemoveDocumentEvent, endRefreshOffset, onRefresh, onPullDownEnd]);

    // 移除touch事件
    const onRemoveTouchEvent = useCallback((): void => {
        const scrollContainerElement = scrollContainer.current;
        if (!stateRef.current.isAddTouchEvent || !scrollContainerElement) return;

        stateRef.current.isAddTouchEvent = false;
        scrollContainerElement.removeEventListener('touchstart', onTouchStart);
        scrollContainerElement.removeEventListener('touchmove', onTouchMove);
        scrollContainerElement.removeEventListener('touchend', onTouchEnd);
    }, [onTouchEnd, onTouchMove, onTouchStart]);

    // 增加touch事件
    const onAddTouchEvent = useCallback(
        (scrollTop: number): void => {
            const scrollContainerElement = scrollContainer.current;

            if (scrollTop <= 0 && scrollContainerElement) {
                if (stateRef.current.isAddTouchEvent) return;
                stateRef.current.isAddTouchEvent = true;
                scrollContainerElement.addEventListener('touchstart', onTouchStart, eventParams);
                scrollContainerElement.addEventListener('touchmove', onTouchMove, eventParams);
                scrollContainerElement.addEventListener('touchend', onTouchEnd, eventParams);
            } else {
                onRemoveTouchEvent();
            }
        },
        [onTouchStart, onTouchMove, onTouchEnd, onRemoveTouchEvent],
    );

    // 检查是否滚动到底部
    const onCheckBottomReached = useCallback((): boolean => {
        const scrollTarget = scrollElementTarget.current;

        if (scrollTarget && scrollTarget.toString() === '[object Window]') {
            const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            return (
                scrollTop + document.documentElement.clientHeight + 100 >=
                    document.body.scrollHeight && enable
            );
        }

        if (scrollTarget) {
            const { height } = scrollTarget.getBoundingClientRect();
            const { scrollTop, scrollHeight } = scrollTarget;
            return height + scrollTop + 100 >= scrollHeight && enable;
        }

        return false;
    }, [enable, scrollElementTarget]);

    // 结束加载后的回掉函数
    const onEndLoader = useCallback((): void => {
        stateRef.current.lock = false;
        stateRef.current.isLoading = false;
    }, []);

    // 开始加载内容
    const onStartLoader = useCallback((): void => {
        stateRef.current.lock = true;
        stateRef.current.isLoading = true;

        if (onEndReached) onEndReached(onEndLoader);
    }, [onEndReached, onEndLoader]);

    // 滚动事件
    const onScroll = useCallback((): void => {
        const scrollTarget = scrollElementTarget.current;
        let scrollTop = 0;

        if (onCheckBottomReached() && !stateRef.current.lock && !stateRef.current.isLoading) {
            onStartLoader();
        }

        if (scrollTarget) {
            scrollTop = onGetScrollTop(scrollTarget);
        }

        if (enableRefresh) {
            onAddTouchEvent(scrollTop);
        }

        if (onScrollEvent) {
            onScrollEvent(scrollTop);
        }
    }, [
        scrollElementTarget,
        onCheckBottomReached,
        enableRefresh,
        onScrollEvent,
        onStartLoader,
        onGetScrollTop,
        onAddTouchEvent,
    ]);

    // loaded中注册监听scroll事件
    const onLoaded = useCallback(() => {
        scrollElementTarget.current = useWindow ? window : scrollEventTarget.current;
        if (scrollElementTarget && scrollElementTarget.current) {
            scrollElementTarget.current.addEventListener('scroll', onScroll);
        }
    }, [onScroll, scrollElementTarget, useWindow]);

    useEffect((): (() => void) => {
        // 注册滚动监听事件
        onLoaded();

        const scrollContainerElement = scrollContainer.current;
        const scrollTarget = scrollElementTarget.current;

        // 浏览器窗口的视口高度是否>0
        const waitInnerHeight = (): void => {
            if (window.innerHeight > 0) {
                initialization();
            } else {
                setTimeout(() => {
                    waitInnerHeight();
                }, 50);
            }
        };

        // 高度 > 0，执行以下初始化
        const initialization = (): void => {
            if (!scrollTarget) return;

            const scrollTop = onGetScrollTop(scrollTarget);
            const scrollHeight = onGetScrollHeight(scrollTarget);
            if (scrollHeight - 10 <= window.innerHeight && scrollTop <= 0 && enableRefresh) {
                onAddTouchEvent(0);
            }
        };

        waitInnerHeight();

        // 卸载组件时解除绑定
        return (): void => {
            if (!scrollTarget || !scrollContainerElement) return;

            scrollTarget.removeEventListener('scroll', onScroll);
            scrollContainerElement.removeEventListener('touchstart', onTouchStart);
            scrollContainerElement.removeEventListener('touchmove', onTouchMove);
            scrollContainerElement.removeEventListener('touchend', onTouchEnd);
        };
    }, [
        enableRefresh,
        onAddTouchEvent,
        onGetScrollHeight,
        onGetScrollTop,
        onLoaded,
        onScroll,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        scrollElementTarget,
    ]);

    useImperativeHandle(
        ref,
        () => ({
            onBackToTop: (): void => {
                const scrollTarget = scrollElementTarget.current;

                if (scrollTarget && scrollTarget.toString() === '[object Window]') {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                }

                if (scrollTarget) {
                    scrollTarget.scrollTop = 0;
                }
                stateRef.current.lock = false;
                stateRef.current.isLoading = false;
            },
            setScrollTop: (scrollTop: number): void => {
                const scrollTarget = scrollElementTarget.current;
                if (scrollTarget) {
                    scrollTarget.scrollTop = scrollTop;
                }
            },
        }),
        [scrollElementTarget],
    );

    return (
        <div
            ref={scrollEventTarget}
            className={`${styles.scrollerWrapper} ${useWindow ? styles.scrollerWindow : ''}`}
        >
            {enableRefresh && (
                <span
                    ref={pullLoadingBox}
                    className={styles.downTip}
                    style={{ top: `${pullDownTop + stateRef.current.pullOffset}px` }}
                >
                    {loadingWhiteImg ? (
                        <img
                            ref={pullLoading}
                            style={{ transform: `rotate(${rotate}deg)`, width: '0.5rem' }}
                            src={WhiteLoading}
                            alt=""
                        />
                    ) : (
                        <img
                            ref={pullLoading}
                            style={{ transform: `rotate(${rotate}deg)` }}
                            src={Loading}
                            alt=""
                        />
                    )}
                </span>
            )}

            <div
                className={styles.scrollerContainer}
                ref={scrollContainer}
                style={{ top: `${pullDownTop}px` }}
            >
                {props.children}

                {enable && !complete && onEndReached && (
                    <div
                        className={`${styles.scrollLoading} ${styles.dFlex} ${styles.justifyContentCenter} ${scrollLoadingClass}`}
                    >
                        <img src={LoadingSpin} alt="" />
                    </div>
                )}

                {complete && isShowComplete && (
                    <div className={styles.complete} style={completeStyle}>
                        {completeText}
                    </div>
                )}
            </div>
        </div>
    );
};

export default forwardRef(Scroll);
