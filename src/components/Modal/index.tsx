import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from './index.scoped.css';

import createPortalRoot, { catchScroll } from '../utils/domUtils';

const MODAL_NAME = 'shm-modal';
const MODAL_ROOT_ID = 'modal-root';

const modalRoot: HTMLElement = createPortalRoot(MODAL_ROOT_ID);

export interface ModalProps {
    // actions for close modal.
    modalCloseEvent?: () => void;
    className?: StyleSheetList | string;
    position?: 'center';
}

class Modal extends React.Component<ModalProps, {}> {
    // modal context append to #modal-root.
    el: HTMLElement;

    constructor(props: ModalProps) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount(): void {
        modalRoot.appendChild(this.el);
        catchScroll(this.el);
    }

    componentWillUnmount(): void {
        modalRoot.removeChild(this.el);
    }

    onModalTouch(e: React.TouchEvent<HTMLElement>): void {
        const targetEl: HTMLElement = e.target as HTMLElement;
        if (targetEl.className.indexOf(MODAL_NAME) >= 0) {
            if (this.props.modalCloseEvent) this.props.modalCloseEvent();
        }
    }

    modalDefaultDom(): React.ReactElement | boolean {
        const { children } = this.props;

        return (
            <main
                className={classNames(MODAL_NAME, styles.modal, this.props.className || null, {
                    [styles.positionCenter]: this.props.position === 'center',
                })}
                onTouchEnd={this.onModalTouch.bind(this)}
            >
                {children}
            </main>
        );
    }

    render(): React.ReactPortal {
        // Use a portal to render the children into the element.
        return ReactDOM.createPortal(
            // Any valid React child: JSX, strings, arrays, etc.
            this.modalDefaultDom(),
            // A DOM element.
            this.el,
        );
    }
}

export default Modal;
