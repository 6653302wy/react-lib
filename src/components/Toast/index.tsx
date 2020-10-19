import { ReactNode } from 'react';
import createNotification, { CreateNotificationType } from './Notification';

interface NoticeHandleType {
    (type: string, content: ReactNode, duration: number): void;
}

let notification: CreateNotificationType;
const notice: NoticeHandleType = (type, content, duration) => {
    if (!notification) notification = createNotification();
    return notification.addNotice({ type, content, duration });
};

export default {
    info(content: ReactNode, duration = 2000): void {
        return notice('info', content, duration);
    },
    success(content: ReactNode, duration = 2000): void {
        return notice('success', content, duration);
    },
};
