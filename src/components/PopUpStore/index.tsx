/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
    ComponentType,
    createContext,
    FunctionComponent,
    useCallback,
    useRef,
    useState,
} from 'react';

type PopUpVo = {
    popUpID: number;
    componentType: ComponentType;
    props: any;
};

type PopUpContextType = {
    /**
     * 弹窗
     * @param componentType 组件类型
     * @return popUpID 组件唯一ID，如果弹出多个相同组件，用popUpID可精准的关闭对应的弹窗
     */
    showPopUp: <T>(componentType: ComponentType<T>, props?: T) => number;
    /**
     * 关闭弹窗
     * @param componentType 组件类型 or showPopUp的返回值(弹窗的唯一ID，popUpID)
     */
    hidePopUp: (componentType: ComponentType<any> | number) => void;
    /** 是否弹出 */
    hasPopUp: (componentType: ComponentType<any>) => boolean;
};
export const PopUpContext = createContext<PopUpContextType>({} as PopUpContextType);
export const PopUpStore: FunctionComponent = ({ children }) => {
    const [popUpList, setPopUpList] = useState<PopUpVo[]>([]);
    const refPopUpGlobalID = useRef(0);
    const showPopUp = useCallback((componentType: ComponentType<any>, props) => {
        refPopUpGlobalID.current += 1;
        const newPopUpVo: PopUpVo = {
            componentType,
            props,
            popUpID: refPopUpGlobalID.current,
        };
        setPopUpList((old) => {
            return [...old, newPopUpVo];
        });
        return newPopUpVo.popUpID;
    }, []);

    const hidePopUp = useCallback((componentType: ComponentType | number) => {
        setPopUpList((old) => {
            const index = old.reverse().findIndex((item) => {
                if (typeof componentType === 'number') {
                    return item.popUpID === componentType;
                }
                return item.componentType === componentType;
            });
            if (index === -1) return old;
            old.splice(index, 1);
            old.reverse();
            return [...old];
        });
    }, []);

    const hasPopUp = useCallback(
        (componentType: ComponentType) => {
            return popUpList.some((item) => {
                return item.componentType === componentType;
            });
        },
        [popUpList],
    );

    return (
        <PopUpContext.Provider value={{ showPopUp, hidePopUp, hasPopUp }}>
            {popUpList.map((item) => {
                return <item.componentType key={item.popUpID} {...item.props} />;
            })}
            {children}
        </PopUpContext.Provider>
    );
};
