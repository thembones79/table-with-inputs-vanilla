import { store } from "./store";
import { postData } from "./api";
import { renderModal, handleLocked } from "./renderers";
import {
  parseDecimal,
  formatDecimal,
  sanitizeInputLive,
  updatePayload,
} from "./data-transformers";

const host = document.querySelector("body")?.dataset?.url || null;
export const params = window.location.search;
export const URL = host ? host + params : window.location.href;

export const onSave = async () => {
  let res: any = {};
  res =
    store.payload &&
    (await postData(`${URL}&save=true`, { payload: store.payload }));

  const { locked } = res;
  if (locked === undefined) {
    return renderModal("Data was not saved<br />Server error", "error");
  }

  handleLocked(locked);
  if (locked === false) {
    renderModal("Data was saved", "success");
  }
};

export function handleInput() {
  const table = document.getElementById("data-table");
  table?.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    if (
      target &&
      (target.classList.contains("calories") ||
        target.classList.contains("heart-rate"))
    ) {
      target.value = sanitizeInputLive(target.value);
    }

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const reps = parseInt(row.children[2].textContent || "0", 10);
      const calories = parseDecimal(
        (row.querySelector(".calories") as HTMLInputElement)?.value || "0",
      );
      const heartRate = parseDecimal(
        (row.querySelector(".heart-rate") as HTMLInputElement)?.value || "0",
      );
      const resultCell = row.querySelector(".result");
      if (resultCell) {
        resultCell.textContent = formatDecimal(reps + calories + heartRate);
      }
    });

    updatePayload();
  });
}

export async function handleSave() {
  document.getElementById("save-btn")?.addEventListener("click", async () => {
    updatePayload();
    await onSave();
  });
}
