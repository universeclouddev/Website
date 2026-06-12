export type FileTab = { id: string; label: string; dot: string };

export const FILES: FileTab[] = [
	{ id: 'readme', label: 'README.md', dot: 'var(--color-syn-blue)' },
	{ id: 'features', label: 'features.yaml', dot: 'var(--color-syn-green)' },
	{ id: 'templates', label: 'templates/', dot: 'var(--color-syn-purple)' },
	{ id: 'cluster', label: 'cluster.txt', dot: 'var(--color-syn-aqua)' },
	{ id: 'preview', label: 'preview/', dot: 'var(--color-syn-yellow)' },
	{ id: 'editions', label: 'editions.toml', dot: 'var(--color-syn-orange)' }
];

export type TermLine = { prompt?: boolean; text: string; tone?: 'out' | 'ok' | 'warn' | 'error' | 'dim' };

export const BOOT_LINES: TermLine[] = [
	{ prompt: true, text: 'java -jar universe-loader.jar' },
	{ text: 'universe-loader 0.0.1 · resolving runtime dependencies… done', tone: 'dim' },
	{ text: 'node-1 starting as MASTER', tone: 'out' },
	{ text: 'hazelcast cluster “universe-cluster” formed · members: 2 · :6000', tone: 'out' },
	{ text: 'REST + WebSocket API listening on :7000', tone: 'ok' },
	{ text: 'instance a1b2c3 (lobby) ONLINE · node-1 · 127.0.0.1:25565', tone: 'ok' },
	{ text: 'instance d4e5f6 (survival) ONLINE · node-2 · 127.0.0.1:25566', tone: 'ok' }
];

export const CONSOLE_LINES: TermLine[] = [
	{ prompt: true, text: 'cluster status' },
	{ text: 'cluster  universe-cluster   members: 2   master: node-1', tone: 'out' },
	{ prompt: true, text: 'instance list' },
	{ text: 'a1b2c3  lobby     ONLINE  node-1  127.0.0.1:25565', tone: 'out' },
	{ text: 'd4e5f6  survival  ONLINE  node-2  127.0.0.1:25566', tone: 'out' },
	{ prompt: true, text: 'instance execute a1b2c3 "say Universe online"' },
	{ text: 'dispatched → a1b2c3', tone: 'ok' }
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
	{ id: 'a1b2c3', name: 'lobby', state: 'ONLINE', node: 'node-1', host: '127.0.0.1', port: 25565, runtime: 'screen' },
	{ id: 'd4e5f6', name: 'survival', state: 'ONLINE', node: 'node-2', host: '127.0.0.1', port: 25566, runtime: 'docker' },
	{ id: 'g7h8i9', name: 'build', state: 'STARTING', node: 'node-3', host: '127.0.0.1', port: 25567, runtime: 'k8s' },
	{ id: 'j1k2l3', name: 'proxy', state: 'ONLINE', node: 'node-1', host: '127.0.0.1', port: 25577, runtime: 'tmux' }
];

export const FEATURES: [string, string, string][] = [
	['single-binary', 'no control plane', 'Master and wrapper live in one fat JAR. Node type is a config field, not a different install.'],
	['clustering', 'hazelcast :6000', 'One master exposes the API and holds cluster state; N wrappers execute instances via task dispatch.'],
	['templates', 'versioned file trees', 'Per group/name, with built-in and custom %VARIABLES% replaced at deploy.'],
	['runtimes', 'screen · tmux · docker · k8s', 'Same configuration — swap one field.'],
	['api', 'REST + WebSocket :7000', 'Everything the console does, over HTTP. Bearer keys with ALL or PUBLIC scopes.'],
	['log-streaming', 'ws frames', 'Live logs from any instance; interactive cluster console at /api/console.'],
	['extensions', 'self-registering JARs', 'Drop into ./extensions/ — storage, databases, metrics, networking, chat-ops.'],
	['gitops', 'argocd export', 'Sync templates from Git; export Kubernetes manifests for ArgoCD tracking.']
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

export const TEMPLATE_VARS: Record<string, string> = {
	SERVER_PORT: '25565',
	INSTANCE_NAME: 'lobby',
	INSTANCE_ID: 'a1b2c3',
	MAX_MEMORY: '4G'
};
