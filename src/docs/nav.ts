import { getCollection } from 'astro:content';
import { SECTIONS } from './sections';

export interface DocLink {
	id: string;
	file: string;
	title: string;
	href: string;
	dot: string;
}

export interface DocFolder {
	dir: string | null;
	label: string;
	dot: string;
	links: DocLink[];
}

export function hrefFor(id: string): string {
	return id === 'introduction' ? '/docs' : `/docs/${id}`;
}

export function sectionOf(id: string): string {
	return id.includes('/') ? id.split('/')[0] : 'root';
}

export function fileOf(id: string): string {
	const name = id.includes('/') ? id.split('/').slice(1).join('/') : id;
	return `${name}.md`;
}

export async function getDocsNav(): Promise<{ folders: DocFolder[]; flat: DocLink[] }> {
	const entries = await getCollection('docs');
	const folders: DocFolder[] = SECTIONS.map((section) => {
		const links = entries
			.filter((entry) => sectionOf(entry.id) === section.key)
			.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
			.map((entry) => ({
				id: entry.id,
				file: fileOf(entry.id),
				title: entry.data.title,
				href: hrefFor(entry.id),
				dot: section.dot
			}));
		return { dir: section.dir, label: section.label, dot: section.dot, links };
	}).filter((folder) => folder.links.length > 0);

	const flat = folders.flatMap((folder) => folder.links);
	return { folders, flat };
}

export function docNeighbors(
	flat: DocLink[],
	href: string
): { prev?: DocLink; next?: DocLink } {
	const i = flat.findIndex((l) => l.href === href);
	if (i === -1) return {};
	return { prev: flat[i - 1], next: flat[i + 1] };
}

export function docCrumb(flat: DocLink[], href: string): DocLink | undefined {
	return flat.find((l) => l.href === href);
}
