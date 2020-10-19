import { useState, useCallback } from 'react';

type Dispatch<A> = (value: A, isRefresh?: boolean) => void;
type SetStateAction<S> = S | ((prevState: S) => S);
type StateValue = number | string | object | null;

const useLocalStorage = <T>(key: string): [StateValue, Dispatch<SetStateAction<T>>] => {
    let state: StateValue = 0;
    let localStorageValue: string | null = null;
    try {
        localStorageValue = localStorage.getItem(key);
        if (!localStorageValue) {
            state = null;
        } else {
            state = JSON.parse(localStorageValue);
        }
    } catch {
        state = localStorageValue;
    }

    const [, setState] = useState<T>(() => {
        try {
            localStorageValue = localStorage.getItem(key);
            if (!localStorageValue) return null;
            return JSON.parse(localStorageValue);
        } catch {
            return null;
        }
    });

    const setValue = useCallback(
        (value, isRefresh = true) => {
            const isObject = typeof value === 'object';

            const serializedState = isObject ? JSON.stringify(value) : `${value}`;

            localStorage.setItem(key, serializedState);

            if (isRefresh) {
                setState(value);
            }
        },
        [key],
    );

    return [state, setValue];
};

export default useLocalStorage;
