
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
		RouteId(): "/" | "/session" | "/session/[sessionId]" | "/session/[sessionId]/completion" | "/session/[sessionId]/questions" | "/session/[sessionId]/results";
		RouteParams(): {
			"/session/[sessionId]": { sessionId: string };
			"/session/[sessionId]/completion": { sessionId: string };
			"/session/[sessionId]/questions": { sessionId: string };
			"/session/[sessionId]/results": { sessionId: string }
		};
		LayoutParams(): {
			"/": { sessionId?: string };
			"/session": { sessionId?: string };
			"/session/[sessionId]": { sessionId: string };
			"/session/[sessionId]/completion": { sessionId: string };
			"/session/[sessionId]/questions": { sessionId: string };
			"/session/[sessionId]/results": { sessionId: string }
		};
		Pathname(): "/" | "/session" | "/session/" | `/session/${string}` & {} | `/session/${string}/` & {} | `/session/${string}/completion` & {} | `/session/${string}/completion/` & {} | `/session/${string}/questions` & {} | `/session/${string}/questions/` & {} | `/session/${string}/results` & {} | `/session/${string}/results/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}