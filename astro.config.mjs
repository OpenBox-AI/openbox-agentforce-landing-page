// Production config: Cloudflare Workers + D1 (database) + R2 (media).
// For a local SQLite preview (or self-hosting on Node) use astro.config.node.mjs:
//   npm run dev:node / npm run build:node
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
		}),
	],
	fonts: [
		// OpenBox Design System: Inter for body, IBM Plex Mono for headings.
		{
			provider: fontProviders.local(),
			name: "Inter",
			cssVariable: "--font-body",
			fallbacks: ["system-ui", "sans-serif"],
			options: {
				variants: [
					{ weight: "100 900", style: "normal", src: ["./src/assets/fonts/inter-latin.woff2"] },
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: "IBM Plex Mono",
			cssVariable: "--font-display",
			fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
			options: {
				variants: [
					{ weight: 400, style: "normal", src: ["./src/assets/fonts/ibm-plex-mono-400.woff2"] },
					{ weight: 700, style: "normal", src: ["./src/assets/fonts/ibm-plex-mono-700.woff2"] },
				],
			},
		},
	],
	devToolbar: { enabled: false },
});
