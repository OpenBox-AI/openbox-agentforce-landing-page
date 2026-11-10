// Small progressive-enhancement script for the landing page. No framework needed.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu-btn]");
const drawer = document.querySelector<HTMLElement>("[data-drawer]");
if (menuBtn && drawer) {
	const set = (open: boolean) => {
		menuBtn.setAttribute("aria-expanded", String(open));
		menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		drawer.dataset.open = String(open);
	};
	menuBtn.addEventListener("click", () => set(menuBtn.getAttribute("aria-expanded") !== "true"));
	drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
	document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
}

/* ---------- Active nav link (scroll spy) ---------- */
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"], .drawer__link[href^="#"]'));
const targets = navLinks
	.map((a) => ({ a, el: document.getElementById(a.getAttribute("href")!.slice(1)) }))
	.filter((t): t is { a: HTMLAnchorElement; el: HTMLElement } => !!t.el);
if (targets.length && "IntersectionObserver" in window) {
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((en) => {
				if (!en.isIntersecting) return;
				navLinks.forEach((a) => a.removeAttribute("aria-current"));
				targets.filter((t) => t.el === en.target).forEach((t) => {
					navLinks.filter((a) => a.getAttribute("href") === t.a.getAttribute("href")).forEach((a) => a.setAttribute("aria-current", "true"));
				});
			});
		},
		{ rootMargin: "-40% 0px -55% 0px" },
	);
	targets.forEach((t) => io.observe(t.el));
}

/* ---------- Policy simulator ---------- */
const sim = document.querySelector<HTMLElement>("[data-sim]");
if (sim) {
	const num = (k: string, d: number) => Number(sim.dataset[k] ?? d);
	const T = { block: num("block", 40), approval: num("approval", 25), constrain: num("constrain", 15), halt: num("halt", 90) };
	const range = sim.querySelector<HTMLInputElement>("[data-sim-range]")!;
	const val = sim.querySelector<HTMLElement>("[data-sim-val]")!;
	const req = sim.querySelector<HTMLElement>("[data-sim-req]")!;
	const chip = sim.querySelector<HTMLElement>("[data-sim-chip]")!;
	const reason = sim.querySelector<HTMLElement>("[data-sim-reason]")!;
	const rule = sim.querySelector<HTMLElement>("[data-sim-rule]")!;
	const hint = sim.querySelector<HTMLElement>(".sim__hint");
	const warm = sim.querySelector<HTMLButtonElement>('[data-sim-rating="warm"]')!;
	const cold = sim.querySelector<HTMLButtonElement>('[data-sim-rating="cold"]')!;
	let isCold = false;
	let auto = false;

	const ICON: Record<string, string> = {
		ALLOW: '<path d="M5 12l5 5L20 7"/>',
		CONSTRAIN: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 12h8"/>',
		"REQUIRE APPROVAL": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
		BLOCK: '<circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/>',
		HALT: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>',
	};
	const decide = (d: number) => {
		if (isCold) return { v: "BLOCK", lead: "Blocked.", rest: " Accounts rated Cold cannot have a discount applied by an agent — the write is refused and logged.", rule: "rule · account.rating == Cold → BLOCK" };
		if (d >= T.halt) return { v: "HALT", lead: "Halted.", rest: ` A ${d}% discount is treated as abuse, so the session is ended for review.`, rule: `rule · discount ≥ ${T.halt}% → HALT` };
		if (d > T.block) return { v: "BLOCK", lead: "Blocked.", rest: ` ${d}% is over the ${T.block}% ceiling. Nothing is written, and the agent explains why.`, rule: `rule · discount > ${T.block}% → BLOCK` };
		if (d > T.approval) return { v: "REQUIRE APPROVAL", lead: "Sent for approval.", rest: ` ${d}% needs a person to sign off. Nothing changes until it is approved.`, rule: `rule · discount > ${T.approval}% → REQUIRE_APPROVAL` };
		if (d > T.constrain) return { v: "CONSTRAIN", lead: "Capped to " + T.constrain + "%.", rest: ` ${d}% runs, but inside your limit — OpenBox writes ${T.constrain}% instead.`, rule: `rule · discount > ${T.constrain}% → CONSTRAIN (cap ${T.constrain}%)` };
		return { v: "ALLOW", lead: "Allowed.", rest: ` Within policy. Salesforce re-checks the user’s own access before the ${d}% discount is written.`, rule: "rule · else → ALLOW" };
	};
	const render = () => {
		const d = Number(range.value);
		val.textContent = `${d}%`;
		range.style.setProperty("--pct", `${d}%`);
		req.textContent = `discount ${d}% on an opportunity${isCold ? " · Cold account" : ""}`;
		const o = decide(d);
		const cls = o.v.replace(/\s+/g, "-");
		chip.innerHTML = `<span class="chip chip--${cls}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICON[o.v]}</svg>${o.v}</span>`;
		reason.innerHTML = `<b>${o.lead}</b>${o.rest}`;
		rule.textContent = o.rule;
	};
	const stop = () => { auto = false; hint?.setAttribute("hidden", ""); };
	range.addEventListener("input", () => { stop(); render(); });
	warm.addEventListener("click", () => { stop(); isCold = false; warm.setAttribute("aria-pressed", "true"); cold.setAttribute("aria-pressed", "false"); render(); });
	cold.addEventListener("click", () => { stop(); isCold = true; cold.setAttribute("aria-pressed", "true"); warm.setAttribute("aria-pressed", "false"); render(); });
	render();
	// Opening grab: slide up to the BLOCK state once, unless the visitor touches it first.
	const target = Number(range.value);
	if (!reduceMotion && target > 5) {
		auto = true;
		range.value = "0";
		render();
		const step = () => {
			if (!auto) return;
			const v = Number(range.value);
			if (v >= target) { auto = false; return; }
			range.value = String(v + 1);
			render();
			setTimeout(step, 42);
		};
		setTimeout(step, 1000);
	}
}

/* ---------- Demo carousel ---------- */
const demo = document.querySelector<HTMLElement>("[data-demo]");
if (demo) {
	const slides = Array.from(demo.querySelectorAll<HTMLElement>("[data-slide]"));
	const tabs = Array.from(demo.querySelectorAll<HTMLButtonElement>("[data-demo-tab]"));
	const n = demo.querySelector<HTMLElement>("[data-demo-n]")!;
	const title = demo.querySelector<HTMLElement>("[data-demo-title]")!;
	const sub = demo.querySelector<HTMLElement>("[data-demo-sub]")!;
	const url = demo.querySelector<HTMLElement>("[data-demo-url]")!;
	const bar = demo.querySelector<HTMLElement>("[data-demo-bar]")!;
	const play = demo.querySelector<HTMLButtonElement>("[data-demo-play]")!;
	const ms = Number(demo.dataset.autoplayMs ?? 5000);
	let i = 0;
	let playing = !reduceMotion;
	// Autoplay only runs while the carousel is on screen (see the IntersectionObserver at the end of this block).
	let inView = typeof IntersectionObserver === "undefined";
	let timer: number | undefined;
	let startedAt = 0;
	const pad = (x: number) => String(x).padStart(2, "0");
	const PLAY = '<path d="M8 5l12 7-12 7V5Z"/>';
	const PAUSE = '<rect x="7" y="5.5" width="3.6" height="13" rx="1.2"/><rect x="13.4" y="5.5" width="3.6" height="13" rx="1.2"/>';
	const restartBar = () => {
		bar.style.transition = "none";
		bar.style.width = "0%";
		void bar.offsetWidth;
		if (playing && inView) { bar.style.transition = `width ${ms}ms linear`; bar.style.width = "100%"; }
	};
	const setPlayIcon = () => {
		play.querySelector("svg")!.innerHTML = playing ? PAUSE : PLAY;
		play.setAttribute("aria-label", playing ? "Pause autoplay" : "Play autoplay");
	};
	const go = (idx: number) => {
		i = (idx + slides.length) % slides.length;
		slides.forEach((s, j) => (s.hidden = j !== i));
		tabs.forEach((t, j) => t.setAttribute("aria-selected", String(j === i)));
		n.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
		title.textContent = slides[i].dataset.title ?? "";
		sub.textContent = slides[i].dataset.sub ?? "";
		url.textContent = slides[i].dataset.url ?? "";
		restartBar();
	};
	const stopTimer = () => { if (timer) window.clearInterval(timer); timer = undefined; };
	const startTimer = () => { stopTimer(); if (!playing || !inView) return; startedAt = Date.now(); timer = window.setInterval(() => go(i + 1), ms); restartBar(); };
	const pause = () => { stopTimer(); playing = false; setPlayIcon(); bar.style.transition = "none"; };
	demo.querySelector("[data-demo-prev]")!.addEventListener("click", () => { go(i - 1); startTimer(); });
	demo.querySelector("[data-demo-next]")!.addEventListener("click", () => { go(i + 1); startTimer(); });
	play.addEventListener("click", () => { if (playing) pause(); else { playing = true; setPlayIcon(); startTimer(); } });
	tabs.forEach((t, j) => t.addEventListener("click", () => { go(j); startTimer(); }));
	// Pause while hovered or focused (WCAG: auto-updating content).
	const hold = () => { if (playing) { stopTimer(); bar.style.transition = "none"; } };
	const release = () => { if (playing) startTimer(); };
	demo.addEventListener("mouseenter", hold);
	demo.addEventListener("mouseleave", release);
	demo.addEventListener("focusin", hold);
	demo.addEventListener("focusout", () => { if (!demo.contains(document.activeElement)) release(); });
	setPlayIcon();
	go(0);
	// Start autoplay when the carousel scrolls into view and pause it (and reset the progress bar) when it leaves.
	if (typeof IntersectionObserver !== "undefined") {
		new IntersectionObserver(
			(entries) => {
				inView = entries[0].isIntersecting;
				if (inView) startTimer();
				else { stopTimer(); bar.style.transition = "none"; bar.style.width = "0%"; }
			},
			{ threshold: 0.25 },
		).observe(demo);
	} else if (playing) startTimer();
}

/* ---------- Copy buttons ---------- */
document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
	btn.addEventListener("click", async () => {
		const text = btn.dataset.copy ?? "";
		const label = btn.textContent;
		try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked — still show feedback */ }
		btn.textContent = "Copied";
		btn.dataset.done = "true";
		setTimeout(() => { btn.textContent = label; delete btn.dataset.done; }, 1400);
	});
});

/* ---------- Design-partner form → opens the visitor's email client ---------- */
const form = document.querySelector<HTMLFormElement>("[data-partner-form]");
if (form) {
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
		const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
		email.setAttribute("aria-invalid", String(!ok));
		if (!ok) { email.focus(); return; }
		const data = new FormData(form);
		const body = [`Work email: ${data.get("email")}`, `Salesforce edition: ${data.get("edition") || "—"}`, `Action to govern: ${data.get("action") || "—"}`].join("\n");
		const to = form.dataset.email || "";
		window.location.href = `mailto:${to}?subject=${encodeURIComponent("Design partner request")}&body=${encodeURIComponent(body)}`;
		form.querySelector<HTMLElement>("[data-form-ok]")?.removeAttribute("hidden");
	});
}

/* ---------- Theme toggle ----------
   The initial theme is set before first paint by an inline script in Base.astro (saved choice, else system setting).
   This wires the toggle buttons, saves the choice, and follows the system setting until the visitor picks one. */
const root = document.documentElement;
const themeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]"));
const currentTheme = () => (root.getAttribute("data-theme") === "dark" ? "dark" : "light");
const syncThemeButtons = () => {
	const next = currentTheme() === "dark" ? "light" : "dark";
	themeButtons.forEach((b) => {
		b.setAttribute("aria-label", `Switch to ${next} mode`);
		b.setAttribute("title", `Switch to ${next} mode`);
	});
};
const applyTheme = (theme: "light" | "dark", persist: boolean) => {
	root.setAttribute("data-theme", theme);
	if (persist) {
		try { localStorage.setItem("obx-theme", theme); } catch { /* storage blocked — the choice just won't persist */ }
	}
	syncThemeButtons();
};
themeButtons.forEach((b) => b.addEventListener("click", () => applyTheme(currentTheme() === "dark" ? "light" : "dark", true)));
window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (e) => {
	let saved: string | null = null;
	try { saved = localStorage.getItem("obx-theme"); } catch { /* ignore */ }
	if (!saved) applyTheme(e.matches ? "dark" : "light", false);
});
syncThemeButtons();
