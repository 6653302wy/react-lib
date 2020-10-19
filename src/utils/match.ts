/** rmb 分(100) 转 元（1.00） */
export const moneyFormat = (money: number, fixed?: number): number | string => {
    if (!money) {
        return 0;
    }
    if (fixed !== undefined) {
        return (Math.floor(money) / 100).toFixed(fixed);
    }
    return Math.floor(money) / 100;
};

/** 折扣计算 */
export const getDiscount = (price: number, finalPrice: number): number => {
    if (price <= 0) {
        return 0;
    }
    if (price === finalPrice) {
        return 0;
    }
    return Math.floor((finalPrice / price) * 100) / 10;
};

/** 数字转换成中文单位(万) */
export const unitTenthousand = (num: number, fixed = 1): number | string => {
    if (num >= 10000) {
        const n = Number((num / 10000).toFixed(fixed));
        return `${n}万`;
    }
    return num;
};

/**
 * @param size
 * 根据设备的DPR，换算750设计稿的逻辑像素
 */
export const getSizeByDPR = (size: number): number => {
    const docFontSize = parseFloat(
        window.getComputedStyle(document.documentElement, null).getPropertyValue('font-size'),
    );
    return (size / 100) * docFontSize;
};