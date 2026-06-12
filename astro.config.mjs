// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

function codeTitle() {
	return {
		name: 'code-title',
		pre(node) {
			const lang = this.options?.lang;
			if (lang) node.properties['data-language'] = lang;
			const raw = this.options?.meta?.__raw;
			if (!raw) return;
			const match = raw.match(/title="([^"]+)"|title='([^']+)'|title=(\S+)/);
			if (match) node.properties['data-title'] = match[1] ?? match[2] ?? match[3];
		}
	};
}

export default defineConfig({
	integrations: [mdx()],
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme: 'tokyo-night',
			transformers: [codeTitle()]
		}
	},
	vite: {
		plugins: [tailwindcss()]
	}
});
