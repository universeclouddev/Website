export const SOURCE_URL = 'https://git.lunarlabs.dev/scala/universe';

export type FileTab = { id: string; label: string; dot: string };

export const FILES: FileTab[] = [
	{ id: 'readme', label: 'README.md', dot: 'var(--color-syn-blue)' },
	{ id: 'stack', label: 'stack.txt', dot: 'var(--color-syn-red)' },
	{ id: 'features', label: 'features.yaml', dot: 'var(--color-syn-green)' },
	{ id: 'templates', label: 'templates/', dot: 'var(--color-syn-purple)' },
	{ id: 'cluster', label: 'cluster.txt', dot: 'var(--color-syn-aqua)' },
	{ id: 'preview', label: 'preview/', dot: 'var(--color-syn-yellow)' },
	{ id: 'editions', label: 'editions.toml', dot: 'var(--color-syn-orange)' }
];

export type TermLine = {
	prompt?: boolean;
	text: string;
	tone?: 'out' | 'ok' | 'warn' | 'error' | 'dim';
	glyph?: 'arrow' | 'ok' | 'warn';
};

export const BOOT_LINES: TermLine[] = [
	{ prompt: true, text: 'docker compose up -d && docker compose attach universe' },
	{ glyph: 'arrow', text: 'Starting Universe in MASTER mode' },
	{ glyph: 'arrow', text: 'Hazelcast advertising 100.64.0.8:6000' },
	{ glyph: 'arrow', text: 'Registered built-in runtimes (tmux, screen, process)' },
	{ glyph: 'arrow', text: 'Installing extensions...' },
	{ glyph: 'ok', text: 'S3 template storage loaded (bucket=templates)' },
	{ glyph: 'ok', text: 'Docker runtime loaded (image=azul-zulu:21-jdk)' },
	{ glyph: 'ok', text: 'Kubernetes runtime loaded (namespace=universe)' },
	{ glyph: 'ok', text: 'Tailscale loaded (ip=100.64.0.8)' },
	{ glyph: 'ok', text: 'Ktor REST API started on 0.0.0.0:7000' },
	{ glyph: 'ok', text: "Auto-spawned instance 564574 · config 'game-server-na'" }
];

export const CONSOLE_LINES: TermLine[] = [
	{ prompt: true, text: 'instance list' },
	{ text: '564574  game-server-na    ONLINE   :25100  docker', tone: 'out' },
	{ text: '27c625  game-lobby-na     ONLINE   :25000  docker', tone: 'out' },
	{ text: '2bb48e  proxy-na          ONLINE   :40188  docker', tone: 'out' },
	{ prompt: true, text: 'cluster status' },
	{ text: 'universe-cluster · members: 1 · master: na-game-1', tone: 'out' },
	{ prompt: true, text: "instance execute 27c625 'say Universe online'" },
	{ glyph: 'ok', text: 'dispatched → 27c625' }
];

export type Instance = {
	id: string;
	name: string;
	state: string;
	node: string;
	host: string;
	port: number;
	runtime: string;
};

export const PREVIEW_INSTANCES: Instance[] = [
	{ id: '564574', name: 'game-server-na', state: 'ONLINE', node: 'na-game-1', host: '100.64.0.8', port: 25100, runtime: 'docker' },
	{ id: '27c625', name: 'game-lobby-na', state: 'ONLINE', node: 'na-game-1', host: '100.64.0.8', port: 25000, runtime: 'docker' },
	{ id: '2bb48e', name: 'proxy-na', state: 'ONLINE', node: 'na-game-1', host: '100.64.0.8', port: 40188, runtime: 'docker' },
	{ id: 'b60372', name: 'anticheat', state: 'ONLINE', node: 'na-game-1', host: '100.64.0.8', port: 4368, runtime: 'docker' },
	{ id: '12192c', name: 'pubapi', state: 'ONLINE', node: 'na-game-1', host: '100.64.0.8', port: 8087, runtime: 'docker' },
	{ id: '559415', name: 'game-server-dev', state: 'STARTING', node: 'na-game-1', host: '100.64.0.8', port: 25101, runtime: 'docker' }
];

export const FEATURES: [string, string, string][] = [
	['clustering', 'master / wrapper', 'One master exposes the REST API; any number of wrapper nodes execute instances. Work is dispatched cluster-wide over Hazelcast — no extra message broker to run.'],
	['templates', 'versioned file-trees', 'Instances are built from versioned template file-trees with dynamic %VARIABLE% replacement. Compose templates per group, choose one-of, or install whole groups.'],
	['runtimes', 'screen · tmux · docker · k8s', 'Built-in screen and tmux. Docker and Kubernetes via extensions. The same configuration deploys to a laptop, a VM fleet, or a cluster without changes.'],
	['api', 'REST + WebSocket :7000', 'Full lifecycle control over HTTP. Stream live logs and an interactive console over WebSockets. Bearer-token auth with ALL / PUBLIC permission scopes and rate limiting.'],
	['extensions', 'self-registering JARs', 'Self-registering JARs add runtimes, storage backends, databases, metrics exporters, and integrations. Drop one in ./extensions and it wires itself up on load.'],
	['gitops', 'git + argocd', 'Sync templates and configs straight from Git, and export Kubernetes manifests for ArgoCD to track. Your fleet topology lives in version control.'],
	['networking', 'tailscale mesh', 'The Tailscale extension exposes mesh IPs as template variables, so instances on different networks connect securely without manual port plumbing.'],
	['observability', 'prometheus · influxdb', 'Prometheus exposition endpoint out of the box, plus an InfluxDB exporter. Daily-rotated structured logs and a styled operational console.'],
	['minecraft', 'paper · velocity · folia', 'First-class plugins for Paper, Spigot, Velocity, BungeeCord and Folia. Proxies auto-register backends and route players with pluggable strategies.']
];

export type StackRow = { key: string; value: string; note?: string };
export type StackGroup = { heading: string; rows: StackRow[] };

export const STACK: StackGroup[] = [
	{
		heading: 'one jar, no external services to run',
		rows: [
			{ key: 'runtime', value: 'jvm · single fat jar', note: 'one process runs master + wrappers' },
			{ key: 'clustering', value: 'hazelcast', note: 'peer-to-peer · unlimited nodes' },
			{ key: 'api', value: 'rest + websocket', note: ':7000 · bearer auth, rate limited' },
			{ key: 'templates', value: 'versioned file-trees', note: '%variable% replacement' }
		]
	},
	{
		heading: 'runtimes · same config, any target',
		rows: [
			{ key: 'built-in', value: 'screen · tmux' },
			{ key: 'extensions', value: 'docker · kubernetes', note: '5+ targets, laptop to fleet' }
		]
	},
	{
		heading: 'integrations · 14 official drop-in extensions',
		rows: [
			{ key: 'storage', value: 'aws s3' },
			{ key: 'databases', value: 'postgresql · redis · mongodb' },
			{ key: 'metrics', value: 'prometheus' },
			{ key: 'networking', value: 'tailscale' },
			{ key: 'gitops', value: 'argocd' },
			{ key: 'proxies', value: 'velocity · paper' },
			{ key: 'chat-ops', value: 'discord' }
		]
	}
];

export const TEMPLATE_SRC: [string, string][] = [
	['# server.properties', 'c'],
	['server-port=%SERVER_PORT%', 'v'],
	['motd=%INSTANCE_NAME% — powered by Universe', 'v'],
	['', ''],
	['# start.flags', 'c'],
	['--instance-id %INSTANCE_ID%', 'v'],
	['--max-memory %MAX_MEMORY%', 'v']
];

export const OSS_ROWS: [string, string | boolean][] = [
	['orchestrator', 'full — master, wrappers, clustering'],
	['node_caps', false],
	['self_host', true],
	['runtimes', 'screen, tmux, docker, kubernetes'],
	['api', 'REST + WebSocket, console, templates'],
	['extensions', 'community ecosystem']
];

export const LICENSED_ROWS: [string, string | boolean][] = [
	['includes', 'everything in open-source'],
	['entitlements', 'key-gated + licensed extensions'],
	['release_channel', 'hardened'],
	['sla', true],
	['deployment_help', 'hands-on, from LunarLabs']
];

export const EDITION_MATRIX: [string, string | boolean, string | boolean][] = [
	['master / wrapper clustering', true, true],
	['template-based deployment', true, true],
	['built-in runtimes (screen, tmux)', true, true],
	['docker & kubernetes runtimes', true, true],
	['REST + WebSocket API', true, true],
	['official extensions (s3, metrics, dbs)', true, true],
	['minecraft plugins (paper, velocity)', true, true],
	['self-host, unlimited nodes', true, true],
	['community support', true, 'priority'],
	['web management panel', 'self-host', 'hosted + sso'],
	['license-key entitlements', false, true],
	['hardened release channel & slas', false, true],
	['onboarding & deployment support', false, true]
];

export const TEMPLATE_VARS: Record<string, string> = {
	SERVER_PORT: '25100',
	INSTANCE_NAME: 'game-server-na',
	INSTANCE_ID: '564574',
	MAX_MEMORY: '6G'
};
