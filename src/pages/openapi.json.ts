import type { APIRoute } from 'astro';
import spec from '../api/openapi.json';

export const GET: APIRoute = () =>
	new Response(JSON.stringify(spec, null, 2), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'content-disposition': 'inline; filename="universe-openapi.json"'
		}
	});
