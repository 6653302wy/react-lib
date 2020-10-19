/**
 * create portal root element by id, if the element is exited return it.
 * @param id, a string if element id.
 */
export default function createPortalRoot(id: string): HTMLElement {
    let portalRoot: HTMLElement | null = document.getElementById(id);
    if (!portalRoot) {
        portalRoot = document.createElement('div');
        portalRoot.setAttribute('id', id);
        document.body.appendChild(portalRoot);
    }
    return portalRoot;
}

export function catchScroll(dom: HTMLElement): void {
    function catchScrollEvent(e: Event): void {
        e.preventDefault();
    }

    dom.addEventListener('touchmove', catchScrollEvent, true);
    dom.addEventListener('mousewheel', catchScrollEvent, true);
}
