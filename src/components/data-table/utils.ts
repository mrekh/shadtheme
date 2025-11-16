import type { ProposalSection } from "./types";

export function reorderSections(
	data: ProposalSection[],
	activeId: string | number,
	overId: string | number,
): ProposalSection[] {
	const next = [...data];
	const fromIndex = next.findIndex((item) => `${item.id}` === `${activeId}`);
	const toIndex = next.findIndex((item) => `${item.id}` === `${overId}`);

	if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
		return data;
	}

	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
}

export function getSelectionSummary(selected: number, total: number): string {
	if (total === 0) {
		return "No rows available.";
	}
	if (selected === 0) {
		return `${total} row(s) available.`;
	}
	return `${selected} of ${total} row(s) selected.`;
}
