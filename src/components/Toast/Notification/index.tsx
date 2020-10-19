import React, {
    ReactElement,
    useState,
    useCallback,
    useMemo,
    ReactNode,
    RefForwardingComponent,
    useImperativeHandle,
    forwardRef,
    AnimationEventHandler,
} from 'react';
import ReactDOM from 'react-dom';
import styles from './index.css';

interface Notice {
    type: string;
    duration: number;
    content: ReactNode;
    key?: string;
    status?: 'willShow' | 'showing' | 'willHide';
    onClose?: Function;
}

type AddNoticeType = (notice: Notice) => void;
type RemoveNoticeType = (key: string) => void;

let seed = 0;
function getUuid(): string {
    seed += 1;
    return `rcNotification_${Date.now()}_${seed}`;
}

interface Ref {
    removeNotice: RemoveNoticeType;
    addNotice: AddNoticeType;
}
const Notification: RefForwardingComponent<Ref> = (props, ref): ReactElement => {
    const [notices, setNotices] = useState<Notice[]>([]);

    const removeNotice: RemoveNoticeType = useCallback((key) => {
        setNotices((list) => list.filter((notice) => notice.key !== key));
    }, []);

    const addNotice: AddNoticeType = useCallback(
        (notice) => {
            const newNotice = { ...notice };
            const newNotices = [...notices];
            const latestNotice = newNotices[newNotices.length - 1];

            Object.assign(newNotice, {
                key: getUuid(),
                status: 'willShow',
            });

            if (latestNotice !== undefined && latestNotice.status === 'showing') {
                latestNotice.status = 'willHide';
            }
            setNotices(newNotices.concat(newNotice));

            const { key } = newNotice;
            setTimeout(() => {
                setNotices((list) =>
                    list.map((e) => {
                        const entry = { ...e };
                        if (entry.key === key) {
                            entry.status = 'willHide';
                        }
                        return entry;
                    }),
                );
            }, newNotice.duration);
        },
        [notices],
    );

    useImperativeHandle(ref, () => ({
        removeNotice,
        addNotice,
    }));

    const getAnimationEndHandler = useCallback(
        (notice: Notice): AnimationEventHandler => {
            return (): void => {
                if (notice.status === 'willHide') {
                    removeNotice(notice.key as string);
                }
            };
        },
        [removeNotice],
    );

    return useMemo(() => {
        return (
            <>
                {notices.map((notice) => (
                    <div
                        className={`${styles.noticeWrap} ${
                            notice.status ? styles[notice.status] : ''
                        } ${styles[notice.type]}`}
                        key={notice.key}
                        onAnimationEnd={getAnimationEndHandler(notice)}
                    >
                        {notice.content}
                    </div>
                ))}
            </>
        );
    }, [getAnimationEndHandler, notices]);
};

const WithRefNotification = forwardRef(Notification);

export interface CreateNotificationType {
    addNotice: AddNoticeType;
    destroy: () => void;
}
const createNotification = (): CreateNotificationType => {
    const div: HTMLDivElement = document.createElement('div');
    document.body.appendChild(div);

    const notificationRef = React.createRef<Ref>();
    ReactDOM.render(<WithRefNotification ref={notificationRef} />, div);

    return {
        addNotice(notice: Notice): void | null {
            return notificationRef.current !== null
                ? notificationRef.current.addNotice(notice)
                : null;
        },
        destroy(): void {
            ReactDOM.unmountComponentAtNode(div);
            document.body.removeChild(div);
        },
    };
};

export default createNotification;
