import { defineBlockComponents } from "emdash/ui";
import Demo from "./Demo.astro";
import Faq from "./Faq.astro";
import Hero from "./Hero.astro";
import Logos from "./Logos.astro";
import Partner from "./Partner.astro";
import Proof from "./Proof.astro";
import Repo from "./Repo.astro";
import Statement from "./Statement.astro";
import Steps from "./Steps.astro";
import TrustStrip from "./TrustStrip.astro";
import Verdicts from "./Verdicts.astro";
import Video from "./Video.astro";

// Map each block type (defined in seed/seed.json) to its Astro renderer.
export const landingComponents = defineBlockComponents<any>({
	agf_hero: Hero,
	agf_trust: TrustStrip,
	agf_logos: Logos,
	agf_video: Video,
	agf_statement: Statement,
	agf_steps: Steps,
	agf_verdicts: Verdicts,
	agf_demo: Demo,
	agf_proof: Proof,
	agf_faq: Faq,
	agf_repo: Repo,
	agf_partner: Partner,
});
