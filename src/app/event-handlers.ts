import { store, type TChanges, type TRow } from "./store";
import { getData, postData, URL } from "./api";
import { renderAiTab, renderTableTab, updateRightContent } from "./renderers";
import {
  updateRows,
  handleInheritedChanges,
  addChange,
  removeChange,
} from "./data-transformers";

export const updateTab = async (tabId: string) => {
  store.activeTab = tabId;
  const tabType = store.tabs
    ? store.tabs.find((t) => t.id === tabId)?.type
    : "";
  store.ingridients = store.lookup
    ? store.lookup[`virtualKey_${tabId}` as keyof typeof store.ingridients]
    : [];
  store.multiFilteredRowData = undefined;
  if (tabType === "group") return renderAiTab();
  return await renderTableTab();
};

export const onChangeGroup = (self: HTMLInputElement) =>
  updateRightContent(self.value);

export const onOptionClick = (id: string, val: string) => {
  const input = document.getElementById(id) as HTMLInputElement;
  if (input.value === val) return;
  input.value = val;
  //@ts-ignore
  input.onchange();
};

export async function onChange(
  self: HTMLInputElement,
  theKey: string,
  col: string,
) {
  store.changes = await getData(`${URL}&get=delta`);
  const { placeholder, value, classList } = self;
  if (placeholder === value) {
    classList.remove("diff-values");
    removeChange(theKey, col);
  } else {
    classList.add("diff-values");
    addChange(theKey, col, value);
  }
  handleInheritedChanges({ col, theKey });
  updateRows(false);
}

export async function onChangeFilters() {
  if (!store.data) return;

  const notEmptyInputs = Array.from(
    document.querySelectorAll("[type='search']"),
    //@ts-ignore
  ).filter((i) => i.value !== "");

  const columnIds = notEmptyInputs.map((i) => i.id.split("_")[1]);

  store.multiFilteredRowData = store.data.filter((row) => {
    const condition = (columnId: string) => {
      const searchInput = document.querySelector(
        `#id_${columnId}`,
      ) as HTMLInputElement;
      const phrase = searchInput ? searchInput.value.toLowerCase() : "";

      return `${row[columnId as keyof TRow]}`.toLowerCase().startsWith(phrase);
    };

    return columnIds.every(condition);
  });
  updateRows(false);
}

export async function onChangeSelect(
  self: HTMLInputElement,
  theKey: string,
  col: string,
) {
  store.changes = await getData(`${URL}&get=delta`);
  const { title, value, classList } = self;
  if (title === value) {
    classList.remove("diff-values");
    removeChange(theKey, col);
  } else {
    classList.add("diff-values");
    addChange(theKey, col, value);
  }
  handleInheritedChanges({ col, theKey });
  updateRows(false);
}

export async function onChangeCheckbox(
  self: HTMLInputElement,
  theKey: string,
  col: string,
) {
  getData(`${URL}&get=delta`).then((dc) => {
    store.changes = dc as TChanges;

    const { checked, classList, title } = self;
    if (title === `${checked}`) {
      classList.remove("diff-values");
      removeChange(theKey, col);
    } else {
      classList.add("diff-values");
      addChange(theKey, col, checked);
    }
    handleInheritedChanges({ col, theKey });
    updateRows(false);
  });
}

export const onSave = async (btn: HTMLButtonElement) => {
  let res: any = {};
  btn.innerText = "Saving...";
  btn.classList.add("btn--hidden");
  res = store.changes && (await postData(`${URL}&save=true`, store.changes));
  btn.innerText = "Data was saved ✅";
  if (res.error) {
    btn.innerText = "Data was NOT saved ❌";
    setTimeout(() => {
      btn.innerText = "Save";
      btn.classList.remove("btn--hidden");
    }, 3000);
  }
};

export async function onExportTableToCSVButtonClick(fileName:string){
  
const csv = store?.csv?.map(row =>
  row.map(cell => saveValue(cell)).join(",")
).join("\n") || "";
downloadCSV(csv, fileName);
}

const downloadCSV = (csvContent:string, filename:string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function saveValue(input: unknown): string {
  const str = String(input);
  return `"${str.replace(/"/g, '""')}"`;
}

