import React, { ReactElement, FunctionComponent } from 'react';

export const isSupportWebp =
    !![].map && document.documentElement.className.indexOf('no-webp') === -1;

interface Props
    extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    webpSrc: string;
}

const WebpImage: FunctionComponent<Props> = ({ webpSrc, src, alt, ...rest }): ReactElement => {
    const newSrc = isSupportWebp ? webpSrc || src : src;
    return <img src={newSrc} {...rest} alt={alt} />;
};

export default WebpImage;
