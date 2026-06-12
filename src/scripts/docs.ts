function initDocTabs() {
	document.querySelectorAll<HTMLElement>('[data-doc-tabs]').forEach((group) => {
		const btns = Array.from(group.querySelectorAll<HTMLElement>('[data-doc-tab]'));
		const panels = Array.from(group.querySelectorAll<HTMLElement>('[data-doc-panel]'));
		btns.forEach((btn) => {
			btn.addEventListener('click', () => {
				const key = btn.getAttribute('data-doc-tab');
				btns.forEach((b) => b.classList.toggle('is-active', b === btn));
				panels.forEach((p) => {
					p.hidden = p.getAttribute('data-doc-panel') !== key;
				});
			});
		});
	});
}

function initCodeChrome() {
	const blocks = document.querySelectorAll<HTMLElement>('.doc-prose pre.astro-code');
	blocks.forEach((pre) => {
		if (pre.closest('.doc-code')) return;

		const label =
			pre.getAttribute('data-title') ?? pre.getAttribute('data-language') ?? 'code';

		const wrap = document.createElement('div');
		wrap.className = 'doc-code';

		const bar = document.createElement('div');
		bar.className = 'doc-code-bar';

		const dot = document.createElement('span');
		dot.className = 'w-2 h-2 rounded-full';
		dot.style.background = 'var(--color-syn-green)';

		const name = document.createElement('span');
		name.textContent = label;

		const copy = document.createElement('button');
		copy.type = 'button';
		copy.className = 'doc-copy';
		copy.textContent = 'copy';
		copy.setAttribute('aria-label', 'copy code');
		copy.addEventListener('click', async () => {
			const code = pre.querySelector('code')?.innerText ?? pre.innerText;
			try {
				await navigator.clipboard.writeText(code);
				copy.textContent = 'copied ✓';
				window.setTimeout(() => (copy.textContent = 'copy'), 1400);
			} catch {
			}
		});

		bar.append(dot, name, copy);

		pre.replaceWith(wrap);
		wrap.append(bar, pre);
	});
}

async function initMermaid() {
	const nodes = Array.from(
		document.querySelectorAll<HTMLElement>('.doc-mermaid pre.mermaid')
	);
	if (!nodes.length) return;

	const [{ default: mermaid }, { default: elkLayouts }] = await Promise.all([
		import('mermaid'),
		import('@mermaid-js/layout-elk')
	]);

	const mono = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";

	mermaid.registerLayoutLoaders(elkLayouts);

	mermaid.initialize({
		startOnLoad: false,
		securityLevel: 'loose',
		theme: 'base',
		layout: 'elk',
		fontFamily: mono,
		flowchart: { curve: 'basis', padding: 18, useMaxWidth: true, htmlLabels: true },
		sequence: {
			useMaxWidth: true,
			actorMargin: 42,
			boxMargin: 10,
			mirrorActors: false,
			messageFontFamily: mono,
			noteFontFamily: mono,
			actorFontFamily: mono
		},
		themeVariables: {
			darkMode: true,
			fontFamily: mono,
			fontSize: '13px',
			background: '#16161e',
			primaryColor: '#292e42',
			primaryBorderColor: '#3b4261',
			primaryTextColor: '#c0caf5',
			secondaryColor: '#1f2335',
			secondaryBorderColor: '#2a2e44',
			tertiaryColor: '#1f2335',
			tertiaryBorderColor: '#2a2e44',
			mainBkg: '#292e42',
			nodeBorder: '#3b4261',
			nodeTextColor: '#c0caf5',
			lineColor: '#565f89',
			textColor: '#a9b1d6',
			titleColor: '#c0caf5',
			clusterBkg: '#1a1b26',
			clusterBorder: '#2a2e44',
			edgeLabelBackground: '#1a1b26',
			labelBackground: '#1a1b26',
			labelBoxBkgColor: '#292e42',
			labelBoxBorderColor: '#3b4261',
			labelTextColor: '#c0caf5',
			actorBkg: '#292e42',
			actorBorder: '#7aa2f7',
			actorTextColor: '#c0caf5',
			actorLineColor: '#3b4261',
			signalColor: '#7aa2f7',
			signalTextColor: '#a9b1d6',
			loopTextColor: '#a9b1d6',
			activationBkgColor: '#24283b',
			activationBorderColor: '#3b4261',
			sequenceNumberColor: '#1a1b26',
			noteBkgColor: '#24283b',
			noteBorderColor: '#3b4261',
			noteTextColor: '#a9b1d6'
		}
	});

	try {
		await mermaid.run({ nodes });
	} catch {
	}
}

export function initDocs() {
	const run = () => {
		initDocTabs();
		initCodeChrome();
		void initMermaid();
	};
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run, { once: true });
	} else {
		run();
	}
}
