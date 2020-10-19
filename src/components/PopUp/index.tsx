import classNames from 'classnames';
import React, { FunctionComponent, useCallback, useRef } from 'react';
import * as ReactDOM from 'react-dom';
import createPortalRoot from '../../utils/domUtils';
import styles from './styles.css';

const panelRoot = createPortalRoot('panel-root');

interface Props {
    /** 是否居中 */
    isCenter?: boolean;
    /** 是否添加黑色蒙版，阻止界面区域外元素点击 */
    isModal?: boolean;
    /** 点击界面外部区域 */
    onOutSideClick?: () => void | undefined;
    /**
     * 启用缩放打开动画
     */
    useScaleTween?: boolean;
    children: React.ReactNode;
}

const Container: FunctionComponent<Props> = ({
    isCenter,
    isModal,
    onOutSideClick,
    useScaleTween,
    children,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    // 监听点击outside关闭弹窗
    const onWindowClick = useCallback(
        (e) => {
            if (!onOutSideClick) return;
            if (modalRef.current && e && e.target && modalRef.current.contains(e.target)) {
                return;
            }
            onOutSideClick();
        },
        [onOutSideClick],
    );

    return (
        <div
            onClick={onWindowClick}
            aria-hidden
            className={classNames(styles.overlay, {
                [styles.overlay_center]: isCenter,
                [styles.overlay_modal]: isModal,
            })}
        >
            <div
                ref={modalRef}
                className={classNames(styles.modal, {
                    [styles.scaleTweenModel]: useScaleTween,
                })}
            >
                {children}
            </div>
        </div>
    );
};

const PopUp: FunctionComponent<Props> = ({
    isModal = true,
    isCenter = true,
    onOutSideClick = undefined,
    useScaleTween = true,
    children,
}) => {
    return ReactDOM.createPortal(
        <Container
            isModal={isModal}
            isCenter={isCenter}
            onOutSideClick={onOutSideClick}
            useScaleTween={useScaleTween}
        >
            {children}
        </Container>,
        panelRoot,
    );
};
export default PopUp;
