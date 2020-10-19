import React, { Fragment, FunctionComponent, ReactElement } from 'react';
import { render } from 'react-dom';
import styles from './styles.css';

export enum HudType {
    TEXT = 2,
    LOADING = 1,
}

export interface Props {
    mark?: boolean;
    text?: string | ReactElement;
    type?: HudType;
    duration?: number;
}

const HudComponent: FunctionComponent<Props> = (props?: Props): ReactElement => {
    const newProps = props || ({} as Props);
    return (
        <Fragment>
            {newProps.mark && <div className={styles.alphaMark}></div>}
            {newProps.type === HudType.LOADING && (
                <Fragment>
                    <div className={styles.hudContainer}>
                        <div className={styles.hudIcon}></div>
                        <span className={styles.hudText}>{newProps.text || '加载中...'}</span>
                    </div>
                </Fragment>
            )}
            {newProps.type === HudType.TEXT && (
                <Fragment>
                    <div className={styles.hudTextContainer}>
                        <div className={styles.hudText}>{newProps.text}</div>
                    </div>
                </Fragment>
            )}
        </Fragment>
    );
};

let bodyElement: HTMLBodyElement | null;
let rootElement: HTMLElement | null;

const getRootElement = (): HTMLElement | null => {
    if (!bodyElement) {
        bodyElement = document.querySelector('body');
    }

    if (!rootElement) {
        rootElement = document.createElement('div');
    }

    if (bodyElement && rootElement) {
        bodyElement.appendChild(rootElement);
    }

    return rootElement;
};

let timer: ReturnType<typeof setTimeout> | null = null;
type CloseCallback = () => void;
const close = (duration?: number | undefined): void => {
    const root = getRootElement();
    if (timer) {
        clearTimeout(timer);
    }
    if (duration) {
        timer = setTimeout(() => {
            if (root && root.parentNode) {
                root.parentNode.removeChild(root);
            }
        }, duration);
    } else if (root && root.parentNode) {
        root.parentNode.removeChild(root);
    }
};

const Hud = {
    Loading(props?: Omit<Props, 'type'>): CloseCallback {
        if (props && props.duration) {
            close(props.duration);
        }

        render(<HudComponent {...props} type={HudType.LOADING} />, getRootElement());

        return (): void => close();
    },
    Text(props?: Omit<Props, 'type'>): CloseCallback {
        if (props && props.duration) {
            close(props.duration);
        }

        render(<HudComponent {...props} type={HudType.TEXT} />, getRootElement());

        return (): void => close();
    },
    async WithPromise<T>(promise: Promise<T>, text = '加载中...', delay = 600): Promise<T> {
        let hudClose: () => void;
        const ticker = setTimeout(() => {
            hudClose = this.Loading({ text, mark: true });
        }, delay);

        const hide = () => {
            clearTimeout(ticker);
            if (hudClose) {
                hudClose();
            }
        };

        try {
            const res = await promise;
            hide();
            return res;
        } catch (err) {
            hide();
            throw err;
        }
    },
};

export default Hud;
