import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

const subscribe = (callback: () => void) => {
	if (typeof window === "undefined") {
		return () => undefined;
	}
	const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
	mql.addEventListener("change", callback);
	return () => mql.removeEventListener("change", callback);
};

const getSnapshot = () => {
	if (typeof window === "undefined") {
		return false;
	}
	return window.innerWidth < MOBILE_BREAKPOINT;
};

export function useIsMobile() {
	return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
