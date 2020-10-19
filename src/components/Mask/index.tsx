import React, { FunctionComponent, ReactElement, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { isFunction } from 'lodash';
import classNames from 'classnames';
import useLockBodyScroll from '../../service/useLockBodyScroll';
import usePortal from '../../service/usePortal';

import styles from './index.css';

export interface PropTypes {
    children: ReactElement;
    clickCallback?: () => void;
    maskClass?: string;
    isLockBodyScroll?: boolean;
    // 是否透明
    isTransparent?: boolean;
    // 位置
    position?: 'center';
}

const Mask: FunctionComponent<PropTypes> = ({
    children,
    clickCallback,
    maskClass,
    isLockBodyScroll = true,
    isTransparent = false,
    position,
}): ReactElement => {
    const target = usePortal('root');

    useLockBodyScroll(isLockBodyScroll);

    const onMaskClick = useCallback(() => {
        if (isFunction(clickCallback)) clickCallback();
    }, [clickCallback]);

    return createPortal(
        <div
            className={classNames(styles.mask, maskClass, {
                [styles.maskTransparent]: isTransparent,
                [styles.maskPositionCenter]: position === 'center',
            })}
            onClick={onMaskClick}
            aria-hidden
        >
            {children}
        </div>,
        target,
    );
};

export default Mask;
