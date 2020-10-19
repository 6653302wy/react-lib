import React, {
    useRef,
    useEffect,
    useCallback,
    FunctionComponent,
    ReactElement,
    MutableRefObject,
} from 'react';
import { isFunction } from 'lodash';

interface PropsType {
    children: ReactElement;
    clickCallback?: (event: MouseEvent) => void;
}
/**
 * Hook that alerts clicks outside of the passed ref
 */
const useOutside = (
    ref: MutableRefObject<HTMLDivElement | null>,
    clickCallback?: (event: MouseEvent) => void,
): void => {
    const handleClickOutside = useCallback(
        (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                if (isFunction(clickCallback)) clickCallback(event);
            }
        },
        [clickCallback, ref],
    );

    useEffect(() => {
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return (): void => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });
};

const Outside: FunctionComponent<PropsType> = ({ children, clickCallback }): ReactElement => {
    const wrapperRef = useRef(null);
    useOutside(wrapperRef, clickCallback);

    return <div ref={wrapperRef}>{children}</div>;
};

export default Outside;
