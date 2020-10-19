import { useCallback, useState } from 'react';

export const useTab = <T>(tabData: T[], defaultSelectedIndex?: number) => {
    const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex || 0);
    const getSelected = useCallback(() => {
        if (selectedIndex < 0 || selectedIndex >= tabData.length) return null;
        return tabData[selectedIndex];
    }, [selectedIndex, tabData]);
    return { selectedIndex, setSelectedIndex, getSelected };
};
