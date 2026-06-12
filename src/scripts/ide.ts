import { TEMPLATE_SRC, FILES } from '../data';

const reduced =
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- scroll-reveal ---------- */
function initReveal() {
	const nodes = Array.from(document.querySelectorAll<HTMLElement>('.u-reveal'));
	if (reduced || typeof IntersectionObserver === 'undefined') {
		nodes.forEach((n) => n.classList.add('is-in'));
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					e.target.classList.add('is-in');
					io.unobserve(e.target);
				}
			}
		},
		{ threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
	);
	nodes.forEach((n) => io.observe(n));
}

/* ---------- terminal typewriter (line-by-line reveal) ---------- */
function initTypewriter() {
	const terms = Array.from(document.querySelectorAll<HTMLElement>('[data-term]'));
	const reveal = (term: HTMLElement) => {
		const lines = Array.from(term.querySelectorAll<HTMLElement>('[data-line]'));
		lines.forEach((line, i) => {
			window.setTimeout(
				() => {
					line.style.opacity = '1';
				},
				reduced ? 0 : i * 160
			);
		});
	};
	if (reduced || typeof IntersectionObserver === 'undefined') {
		terms.forEach(reveal);
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					reveal(e.target as HTMLElement);
					io.unobserve(e.target);
				}
			}
		},
		{ threshold: 0.25 }
	);
	terms.forEach((t) => io.observe(t));
}

/* ---------- scrollspy + status bar ---------- */
function initScrollspy() {
	const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
	const tabTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-tab]'));
	const sbFile = document.getElementById('sb-file');
	const sbLine = document.getElementById('sb-line');
	const sbPct = document.getElementById('sb-pct');
	const labelById = new Map(FILES.map((f) => [f.id, f.label] as const));
	const FAKE_LINES = 248;
	let current = '';

	const setActive = (id: string) => {
		if (id === current) return;
		current = id;
		tabTargets.forEach((t) =>
			t.classList.toggle('is-active', t.getAttribute('data-tab') === id)
		);
		const label = labelById.get(id);
		if (sbFile && label) sbFile.textContent = `~/universe/${label}`;
	};

	const update = () => {
		// active section = last one whose top is above the fold line
		let active = sections[0];
		for (const s of sections) {
			if (s.getBoundingClientRect().top <= 140) active = s;
		}
		if (active) setActive(active.id);

		// status bar line:col + percentage from scroll position
		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		const pct = max > 0 ? window.scrollY / max : 0;
		if (sbLine) sbLine.textContent = `${Math.round(pct * (FAKE_LINES - 1)) + 1}:1`;
		if (sbPct)
			sbPct.textContent = pct <= 0.001 ? 'Top' : pct >= 0.999 ? 'Bot' : `${Math.round(pct * 100)}%`;
	};

	let ticking = false;
	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			update();
			ticking = false;
		});
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	update();
}

/* ---------- vim keybindings ---------- */
function initVimKeys() {
	const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
	let lastG = 0;
	const editable = (el: EventTarget | null) => {
		const n = el as HTMLElement | null;
		if (!n) return false;
		const tag = n.tagName;
		return tag === 'INPUT' || tag === 'TEXTAREA' || n.isContentEditable;
	};
	window.addEventListener('keydown', (e) => {
		if (e.metaKey || e.ctrlKey || e.altKey || editable(e.target)) return;
		switch (e.key) {
			case 'j':
				window.scrollBy({ top: 90, behavior: 'instant' as ScrollBehavior });
				break;
			case 'k':
				window.scrollBy({ top: -90, behavior: 'instant' as ScrollBehavior });
				break;
			case 'G':
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
				break;
			case 'g': {
				const now = Date.now();
				if (now - lastG < 400) window.scrollTo({ top: 0, behavior: 'smooth' });
				lastG = now;
				break;
			}
			default: {
				const num = Number(e.key);
				if (num >= 1 && num <= sections.length) {
					sections[num - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
		}
	});
}

/* ---------- foldable feature rows ---------- */
function initFolds() {
	document.querySelectorAll<HTMLElement>('[data-fold]').forEach((btn) => {
		btn.addEventListener('click', () => {
			btn.closest('li')?.classList.toggle('is-open');
		});
	});
}

/* ---------- preview sub-tabs ---------- */
function initPreviewTabs() {
	const root = document.querySelector<HTMLElement>('[data-preview]');
	if (!root) return;
	const section = root.closest('[data-section]') ?? document;
	const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-subtab]'));
	const panels = Array.from(section.querySelectorAll<HTMLElement>('[data-panel]'));
	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			const key = tab.getAttribute('data-subtab');
			tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
			panels.forEach((p) => {
				p.hidden = p.getAttribute('data-panel') !== key;
			});
		});
	});
}

/* ---------- template playground ---------- */
function initTemplate() {
	const out = document.getElementById('tpl-out');
	if (!out) return;
	const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-var]'));

	const values = () => {
		const map: Record<string, string> = {};
		inputs.forEach((i) => {
			map[i.getAttribute('data-var') ?? ''] = i.value;
		});
		return map;
	};

	const render = () => {
		const vals = values();
		out.replaceChildren();
		for (const [text, kind] of TEMPLATE_SRC) {
			const row = document.createElement('div');
			row.className = 'whitespace-pre min-h-[1.7em]';
			if (kind === 'c') {
				const s = document.createElement('span');
				s.className = 'syn-comment';
				s.textContent = text;
				row.appendChild(s);
			} else if (kind === '') {
				row.textContent = ' ';
			} else {
				for (const part of text.split(/(%[A-Z_]+%)/)) {
					if (/^%[A-Z_]+%$/.test(part)) {
						const name = part.slice(1, -1);
						const s = document.createElement('span');
						s.className = 'syn-yellow';
						s.textContent = vals[name] ?? part;
						row.appendChild(s);
					} else if (part) {
						const s = document.createElement('span');
						s.className = 'text-fg-1';
						s.textContent = part;
						row.appendChild(s);
					}
				}
			}
			out.appendChild(row);
		}
	};

	inputs.forEach((i) => i.addEventListener('input', render));
	render();
}

/* ---------- copy buttons ---------- */
function initCopy() {
	document.querySelectorAll<HTMLElement>('[data-copy]').forEach((btn) => {
		btn.addEventListener('click', async () => {
			const text = btn.getAttribute('data-copy') ?? '';
			try {
				await navigator.clipboard.writeText(text);
				const prev = btn.textContent;
				btn.textContent = 'copied ✓';
				window.setTimeout(() => (btn.textContent = prev), 1400);
			} catch {
				/* clipboard unavailable */
			}
		});
	});
}

export function initIde() {
	const run = () => {
		initReveal();
		initTypewriter();
		initScrollspy();
		initVimKeys();
		initFolds();
		initPreviewTabs();
		initTemplate();
		initCopy();
	};
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run, { once: true });
	} else {
		run();
	}
}
