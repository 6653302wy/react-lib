// rem to px
export const remTopx = (n: number, base = 750): number => {
    return n * 100 * (document.documentElement.offsetWidth / base);
};

// 获取滚动条位置
export const getScrollTop = (): number => {
    return document.documentElement.scrollTop || document.body.scrollTop;
};

// 滚动到指定位置
export const setScrollTop = (top: number, smooth = false): void => {
    if (smooth && 'scrollBehavior' in document.documentElement.style) {
        try {
            window.scrollTo({
                top,
                behavior: 'smooth',
            });
        } catch (e) {
            document.documentElement.scrollTop = top;
            document.body.scrollTop = top;
        }
    } else {
        document.documentElement.scrollTop = top;
        document.body.scrollTop = top;
    }
};