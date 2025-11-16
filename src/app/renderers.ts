// Renderers perform DOM manipulations
// Name starts with render

import {
  Footer,
} from "./components";

export const reRenderFooter = () => {
  const footer = document.querySelector(".footer");
  if (!footer) return;
  footer.outerHTML = Footer();
};
