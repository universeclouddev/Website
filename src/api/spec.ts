import rawSpec from './openapi.json';

const spec = rawSpec as any;

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type Param = {
	name: string;
	in: string;
	required: boolean;
	type: string;
	description?: string;
};

export type Body = {
	contentType: string;
	type: string;
	required: boolean;
	ref?: string;
};

export type ResponseRow = {
	status: string;
	description: string;
	type?: string;
	ref?: string;
};

export type Endpoint = {
	method: HttpMethod;
	verb: string;
	path: string;
	summary: string;
	description: string;
	public: boolean;
	websocket: boolean;
	params: Param[];
	body?: Body;
	responses: ResponseRow[];
	curl: string;
};

export type Group = {
	id: string;
	label: string;
	dot: string;
	blurb: string;
	endpoints: Endpoint[];
};

export type SchemaProp = {
	name: string;
	type: string;
	ref?: string;
	required: boolean;
	nullable: boolean;
	description?: string;
	example?: string;
	defaultValue?: string;
};

export type SchemaDef = {
	name: string;
	description?: string;
	enumValues?: string[];
	props: SchemaProp[];
};

export const API_INFO = {
	title: spec.info.title as string,
	version: spec.info.version as string,
	openapi: spec.openapi as string,
	baseUrl: 'http://localhost:7000/api'
};

const refName = (ref: string) => ref.split('/').pop() as string;

function refOf(schema: any): string | undefined {
	if (!schema) return undefined;
	if (schema.$ref) return refName(schema.$ref);
	if (schema.type === 'array' && schema.items?.$ref) return refName(schema.items.$ref);
	return undefined;
}

function typeLabel(schema: any): string {
	if (!schema) return 'any';
	if (schema.$ref) return refName(schema.$ref);
	switch (schema.type) {
		case 'array':
			return `${typeLabel(schema.items)}[]`;
		case 'object':
			if (schema.additionalProperties) return `Record<string, ${typeLabel(schema.additionalProperties)}>`;
			return 'object';
		case 'integer':
			return schema.format ? `int<${schema.format}>` : 'integer';
		case 'number':
			return 'number';
		case 'boolean':
			return 'boolean';
		case 'string':
			if (Array.isArray(schema.enum)) return schema.enum.map((e: string) => `"${e}"`).join(' | ');
			if (schema.format === 'binary') return 'binary';
			return 'string';
		default:
			return (schema.type as string) ?? 'any';
	}
}

const GROUP_META: Record<string, { label: string; dot: string; blurb: string }> = {
	node: { label: 'node.http', dot: 'var(--color-syn-blue)', blurb: 'health, node info, config & metrics' },
	cluster: { label: 'cluster.http', dot: 'var(--color-syn-aqua)', blurb: 'hazelcast members & remote dispatch' },
	instances: {
		label: 'instances.http',
		dot: 'var(--color-syn-green)',
		blurb: 'deploy, inspect, control & stream instances'
	},
	configurations: {
		label: 'configurations.http',
		dot: 'var(--color-syn-orange)',
		blurb: 'instance blueprints'
	},
	templates: {
		label: 'templates.http',
		dot: 'var(--color-syn-purple)',
		blurb: 'versioned file-trees & %variables%'
	},
	console: { label: 'console.http', dot: 'var(--color-syn-yellow)', blurb: 'master console over http & websocket' }
};

const GROUP_ORDER = ['node', 'cluster', 'instances', 'configurations', 'templates', 'console'];

function stripMd(text: string | undefined): string | undefined {
	if (text === undefined) return undefined;
	return text
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/__(.+?)__/g, '$1')
		.replace(/`([^`]+?)`/g, '$1');
}

function groupKey(path: string): string {
	if (path === '/ping' || path === '/metrics' || path.startsWith('/node')) return 'node';
	if (path.startsWith('/cluster')) return 'cluster';
	if (path.startsWith('/instances')) return 'instances';
	if (path.startsWith('/configurations')) return 'configurations';
	if (path.startsWith('/templates')) return 'templates';
	if (path.startsWith('/commands') || path === '/console') return 'console';
	return 'node';
}

function resolveResponse(status: string, resp: any): ResponseRow {
	if (resp?.$ref) {
		const name = refName(resp.$ref);
		const shared = spec.components?.responses?.[name];
		return { status, description: stripMd(shared?.description) ?? name };
	}
	const json = resp?.content?.['application/json']?.schema;
	const text = resp?.content?.['text/plain']?.schema;
	const zip = resp?.content?.['application/zip']?.schema;
	const schema = json ?? text ?? zip;
	return {
		status,
		description: stripMd(resp?.description) ?? '',
		type: schema ? typeLabel(schema) : undefined,
		ref: refOf(schema)
	};
}

function bodyOf(op: any): Body | undefined {
	const content = op.requestBody?.content;
	if (!content) return undefined;
	const ct = Object.keys(content)[0];
	const schema = content[ct]?.schema;
	return {
		contentType: ct,
		type: typeLabel(schema),
		required: op.requestBody?.required === true,
		ref: refOf(schema)
	};
}

function buildCurl(verb: string, path: string, isPublic: boolean, body?: Body): string {
	const url = `:7000/api${path}`;
	const lines: string[] = [];
	const head = verb === 'GET' ? `curl ${url}` : `curl -X ${verb} ${url}`;
	lines.push(head);
	if (!isPublic) lines.push(`  -H "Authorization: Bearer $KEY"`);
	if (body) {
		if (body.contentType === 'application/json') {
			lines.push(`  -H "Content-Type: application/json"`);
			lines.push(`  -d '{ … }'`);
		} else if (body.contentType === 'text/plain') {
			lines.push(`  --data-binary @file.txt`);
		} else {
			lines.push(`  --data-binary @archive.zip`);
		}
	}
	return lines.join(' \\\n');
}

function buildEndpoint(method: HttpMethod, path: string, op: any): Endpoint {
	const isPublic = Array.isArray(op.security) && op.security.length === 0;
	const websocket = Boolean(op.responses?.['101']);
	const verb = method.toUpperCase();
	const params: Param[] = (op.parameters ?? []).map((p: any) => ({
		name: p.name,
		in: p.in,
		required: p.required === true,
		type: typeLabel(p.schema),
		description: stripMd(p.description)
	}));
	const body = bodyOf(op);
	const responses: ResponseRow[] = Object.entries(op.responses ?? {}).map(([status, resp]) =>
		resolveResponse(status, resp)
	);
	return {
		method,
		verb,
		path,
		summary: op.summary ?? '',
		description: stripMd(op.description) ?? '',
		public: isPublic,
		websocket,
		params,
		body,
		responses,
		curl: buildCurl(verb, path, isPublic, body)
	};
}

function buildGroups(): Group[] {
	const buckets: Record<string, Endpoint[]> = {};
	const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];
	for (const [path, item] of Object.entries<any>(spec.paths)) {
		for (const method of methods) {
			if (!item[method]) continue;
			const key = groupKey(path);
			(buckets[key] ??= []).push(buildEndpoint(method, path, item[method]));
		}
	}
	return GROUP_ORDER.filter((k) => buckets[k]?.length).map((k) => ({
		id: `grp-${k}`,
		label: GROUP_META[k].label,
		dot: GROUP_META[k].dot,
		blurb: GROUP_META[k].blurb,
		endpoints: buckets[k]
	}));
}

function buildSchemas(): SchemaDef[] {
	const out: SchemaDef[] = [];
	for (const [name, schema] of Object.entries<any>(spec.components?.schemas ?? {})) {
		const required: string[] = schema.required ?? [];
		const props: SchemaProp[] = Object.entries<any>(schema.properties ?? {}).map(([propName, p]) => ({
			name: propName,
			type: typeLabel(p),
			ref: refOf(p),
			required: required.includes(propName),
			nullable: p.nullable === true,
			description: stripMd(p.description),
			example: p.example !== undefined ? JSON.stringify(p.example) : undefined,
			defaultValue: p.default !== undefined ? JSON.stringify(p.default) : undefined
		}));
		out.push({
			name,
			description: stripMd(schema.description),
			enumValues: schema.type === 'string' && Array.isArray(schema.enum) ? schema.enum : undefined,
			props
		});
	}
	return out;
}

export const API_GROUPS: Group[] = buildGroups();
export const API_SCHEMAS: SchemaDef[] = buildSchemas();

export const API_NAV = [
	{ id: 'overview', label: 'README.md', dot: 'var(--color-syn-blue)' },
	...API_GROUPS.map((g) => ({ id: g.id, label: g.label, dot: g.dot })),
	{ id: 'schemas', label: 'schemas.ts', dot: 'var(--color-syn-red)' }
];

export const API_STATS = {
	endpoints: API_GROUPS.reduce((n, g) => n + g.endpoints.length, 0),
	groups: API_GROUPS.length,
	schemas: API_SCHEMAS.length,
	websockets: API_GROUPS.reduce((n, g) => n + g.endpoints.filter((e) => e.websocket).length, 0)
};
