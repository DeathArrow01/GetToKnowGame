
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/analytics" | "/admin/performance" | "/admin/questions" | "/admin/sections" | "/admin/sessions" | "/session" | "/session/[sessionId]" | "/session/[sessionId]/completion" | "/session/[sessionId]/questions" | "/session/[sessionId]/results";
		RouteParams(): {
			"/session/[sessionId]": { sessionId: string };
			"/session/[sessionId]/completion": { sessionId: string };
			"/session/[sessionId]/questions": { sessionId: string };
			"/session/[sessionId]/results": { sessionId: string }
		};
		LayoutParams(): {
			"/": { sessionId?: string };
			"/admin": Record<string, never>;
			"/admin/analytics": Record<string, never>;
			"/admin/performance": Record<string, never>;
			"/admin/questions": Record<string, never>;
			"/admin/sections": Record<string, never>;
			"/admin/sessions": Record<string, never>;
			"/session": { sessionId?: string };
			"/session/[sessionId]": { sessionId: string };
			"/session/[sessionId]/completion": { sessionId: string };
			"/session/[sessionId]/questions": { sessionId: string };
			"/session/[sessionId]/results": { sessionId: string }
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/analytics" | "/admin/analytics/" | "/admin/performance" | "/admin/performance/" | "/admin/questions" | "/admin/questions/" | "/admin/sections" | "/admin/sections/" | "/admin/sessions" | "/admin/sessions/" | "/session" | "/session/" | `/session/${string}` & {} | `/session/${string}/` & {} | `/session/${string}/completion` & {} | `/session/${string}/completion/` & {} | `/session/${string}/questions` & {} | `/session/${string}/questions/` & {} | `/session/${string}/results` & {} | `/session/${string}/results/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}