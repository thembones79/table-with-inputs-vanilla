import { getData, URL } from "./api";
import { renderTable, renderModal, handleLocked } from "./renderers";
import { store, type TStore } from "./store";
import { createInitialPayload } from "./data-transformers";
import { handleInput, handleSave } from "./event-handlers";

export const initApp = async () => {
  const response: TStore | undefined = await getData(`${URL}&get=glTable`);
  if (!response) return renderModal("Uuups", "error");
  const { data, locked, decimal } = response;
  store.data = data;
  store.decimal = decimal;
  const app = document.getElementById("app") as HTMLDivElement;
  app.outerHTML = renderTable(store.data);
  createInitialPayload(store.data);
  handleInput();
  await handleSave();
  handleLocked(locked);
};
