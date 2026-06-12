export interface DocSection {
	key: string;
	dir: string | null;
	label: string;
	dot: string;
}

export const SECTIONS: DocSection[] = [
	{ key: 'root', dir: null, label: 'docs/', dot: 'var(--color-syn-blue)' },
	{ key: 'configuration', dir: 'configuration', label: 'configuration/', dot: 'var(--color-syn-purple)' },
	{ key: 'runtimes', dir: 'runtimes', label: 'runtimes/', dot: 'var(--color-syn-aqua)' },
	{ key: 'extensions', dir: 'extensions', label: 'extensions/', dot: 'var(--color-syn-green)' },
	{ key: 'minecraft', dir: 'minecraft', label: 'minecraft/', dot: 'var(--color-syn-orange)' },
	{ key: 'operations', dir: 'operations', label: 'operations/', dot: 'var(--color-syn-yellow)' },
	{ key: 'api-reference', dir: 'api-reference', label: 'api-reference/', dot: 'var(--color-syn-red)' }
];
