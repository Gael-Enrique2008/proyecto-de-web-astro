import { n as __exportAll, t as createComponent } from "./compiler_29qw__kg.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_CcYl0Pv_.mjs";
import { t as $$BaseLayout } from "./BaseLayout_CyOznmAD.mjs";
//#region src/pages/[...path].astro
var ____path__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Component,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
var $$Component = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Quest Merchant" }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "App", null, {
		"client:only": "react",
		"client:component-hydration": "only",
		"client:component-path": "C:/Users/GaelM/Downloads/proyecto-de-web-astro/front-astro/src/react-app/App.jsx",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/GaelM/Downloads/proyecto-de-web-astro/front-astro/src/pages/[...path].astro", void 0);
var $$file = "C:/Users/GaelM/Downloads/proyecto-de-web-astro/front-astro/src/pages/[...path].astro";
var $$url = "/[...path]";
//#endregion
//#region \0virtual:astro:page:src/pages/[...path]@_@astro
var page = () => ____path__exports;
//#endregion
export { page };
