import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

export default defineConfig({
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: "file:./data.db" }),
			storage: local({
				directory: "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
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
