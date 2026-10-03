import { t as createComponent } from "./compiler_29qw__kg.mjs";
import { f as renderHead, s as renderSlot, u as renderTemplate, x as createAstro } from "./server_CcYl0Pv_.mjs";
//#region src/layouts/BaseLayout.astro
createAstro("https://astro.build");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title = "Web" } = Astro.props;
	return renderTemplate`<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${title}</title>${renderHead($$result)}</head><body>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "C:/Users/GaelM/Downloads/proyecto-de-web-astro/front-astro/src/layouts/BaseLayout.astro", void 0);
//#endregion
export { $$BaseLayout as t };
