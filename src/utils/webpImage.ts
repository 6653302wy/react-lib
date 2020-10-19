export interface ImageOptions {
    size?: number;
    
    width?: number;
    
    height?: number;
    
    quality?: number;
    
    format?: string;
    
    sharpen?: number;
}
export const webpImage = (url: string, opts: ImageOptions = {}): string => {
    if (url.indexOf('data:image') === 0 || isIOS) return url;
    const options: ImageOptions = {
        quality: 90,
        format: 'webp',
        ...opts,
    };
    return `${url}?x-oss-process=image/quality,q_${options.quality}/format,${options.format}`;
};