import type { APIRoute } from "astro";
import { getContentSeo, getEmDashCollection, getSiteSettings } from "emdash";

export const prerender = false;

/**
 * Child sitemap for the "pages" collection. It replaces the one EmDash generates (same URL, and the
 * `/sitemap.xml` index still points here) so the home entry is listed at "/" — its canonical URL — rather
 * than "/home", which now redirects to "/".
 */
const escapeXml = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ url }) => {
	const [{ entries, error }, settings] = await Promise.all([
		getEmDashCollection("pages", { status: "published" }),
		getSiteSettings(),
	]);
	if (error) {
		return new Response("<!-- Failed to generate sitemap -->", { status: 500, headers: { "Content-Type": "application/xml" } });
	}
	const origin = (settings?.url || url.origin).replace(/\/$/, "");

	const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
	for (const entry of entries) {
		if (getContentSeo(entry as never)?.noIndex) continue; // honours "Hide from search engines"
		const path = entry.id === "home" ? "/" : `/${entry.id}`;
		const updated = entry.data.updatedAt instanceof Date ? entry.data.updatedAt.toISOString() : String(entry.data.updatedAt ?? "");
		lines.push("  <url>", `    <loc>${escapeXml(origin + path)}</loc>`);
		if (updated) lines.push(`    <lastmod>${escapeXml(updated)}</lastmod>`);
		lines.push("  </url>");
	}
	lines.push("</urlset>");

	return new Response(lines.join("\n"), {
		status: 200,
		headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
