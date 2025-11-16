import {
  store,
  type TRow,
  type TGroups,
  type TCreateMappedValueType,
  type TFilter,
  type TMapped,
  type TMappedRiskLevelErRecon,
} from "./store";
import { postData, URL } from "./api";
import { Row, RowF } from "./components";
import { renderAiTab } from "./renderers";

export interface ICreateMappedValue {
  type: TCreateMappedValueType | TFilter;
  row: TRow;
}

export interface IHandleInheritedChanges {
  col: string;
  theKey: string;
}

const aChng = (
  theKey: string,
  col: string,
  val: string | boolean | string[] | Record<string, boolean>,
) => {
  if (!store.changes) return;
  if (!store.changes[theKey]) {
    store.changes[theKey] = { [col]: val };
  }
  store.changes[theKey][col] = val;
};

const rChng = (theKey: string, col: string) => {
  if (!store.changes) return;
  delete store.changes[theKey][col];
  if (!Object.keys(store.changes[theKey]).length) {
    delete store.changes[theKey];
  }
};

export const addChange = (
  theKey: string,
  col: string,
  val: string | boolean | string[] | Record<string, boolean>,
) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => aChng(k, col, val));
  } else {
    aChng(theKey, col, val);
  }
};

export const removeChange = (theKey: string, col: string) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => rChng(k, col));
  } else {
    rChng(theKey, col);
  }
};

export const getColumns = (data: TRow[]) => Object.keys(data[0]);

export const createVirtualGroupKey = (row: TRow) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = store.changes && store.changes[changedRecordKey];
  return store.ingridients
    ? store.ingridients
        .map((i) => {
          const ingridientValue =
            areChanges && areChanges[i] !== undefined
              ? areChanges[i]
              : row[i as keyof typeof row];
          if (i === "oneSided") return ingridientValue ? "1S" : "2S";
          return ingridientValue;
        })
        .filter(Boolean)
        .join("_")
    : "";
};

export const createMappedValue = ({ type, row }: ICreateMappedValue) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = store.changes && store.changes[changedRecordKey];
  if (!store.lookup) return "";
  const { source, dict } = store.lookup[type] as
    | TMapped
    | TMappedRiskLevelErRecon;
  const sourceVal = source
    ? areChanges && areChanges[source]
      ? areChanges[source]
      : row[source as keyof typeof row]
    : "";
  const mappedVal =
    sourceVal !== undefined ? dict[sourceVal as keyof typeof dict] : "";

  return mappedVal;
};

export const createGroupedData = (storeData = store.data) => {
  const groups: TGroups = {};
  storeData?.forEach((row) => {
    const vKey = createVirtualGroupKey(row);
    if (!groups[vKey]) {
      //@ts-ignore
      groups[vKey] = { ...row };
      groups[vKey].ska1GlCodes = {};
    }
    groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
    const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
    const changedCodes = Object.keys(store.changes || {});
    const groupChanged =
      changedCodes.includes(row.ska1GlCode) &&
      groupCodes.includes(row.ska1GlCode);
    if (groupChanged) {
      groups[vKey].groupChanged = true;
    }
  });
  return groups;
};

const createGroupedDataFiltered = () => {
  const storeData = store.data;
  if(!storeData) return {};
  const filteredData = storeData.filter((row) => {
  const changedValue = store.changes?.[row.ska1GlCode]
  if (changedValue === undefined) return row.inScope;
  const scope = changedValue.inScope
  if (scope === undefined) return row.inScope;
  return scope;
});
return createGroupedData(filteredData);
};

export const refreshGroups = () => {
  store.groups = createGroupedData();
  store.groupKeys = Object.keys(store.groups).filter(Boolean).sort();
  store.groupsFiltered = createGroupedDataFiltered();
  store.groupKeysFiltered = Object.keys(store.groupsFiltered)
    .filter(Boolean)
    .sort();
};

export const currentOrFirstGroup = () => {
  if (!store.groupKeys) return "";
  if (!store.selectedGroup) return store.groupKeys[0];
  if (store.groupKeys.includes(store.selectedGroup)) return store.selectedGroup;
  return store.groupKeys[0];
};

const isChangeAffectsGroup = (col: string) => store.ingridients?.includes(col);

export const handleInheritedChanges = ({
  col,
  theKey,
}: IHandleInheritedChanges) => {
  if (!isChangeAffectsGroup(col)) return;
  if (theKey.includes(",")) return;

  const tabType = store.tabs?.find((t) => t.id === store.activeTab)?.type;
  if (tabType !== "group") return;

  const row = store.data?.filter(({ ska1GlCode }) => ska1GlCode === theKey)[0];
  if (!row || !store.tabs || !store.groups) return;

  const newVirtKey = createVirtualGroupKey(row);
  const groupData = store.groups[newVirtKey];
  const ai = store.tabs.find((t) => t.id === store.activeTab)?.columns;
  const changeableAiCols = ai
    ? Object.keys(ai).filter((c) => ai[c].changeable === "y")
    : [];
  if (groupData) {
    changeableAiCols.forEach((c) => {
      const changedData = groupData[c as keyof typeof groupData];
      if (row[c as keyof typeof row] !== changedData)
        addChange(theKey, c, changedData);
    });
  } else {
    changeableAiCols.forEach((c) => {
      removeChange(theKey, c);
    });
  }
};

export const updateRows = async (shouldSave = true) => {
  if (!store.data) return;
  const searchFilter = document.getElementById(
    "filter-rows",
  ) as HTMLInputElement;
  const phrase = searchFilter ? searchFilter.value.toLowerCase() : "";
  refreshGroups();
  const type = store.tabs?.find((t) => t.id == store.activeTab)?.type;
  let cols: string[];
  const theData = store?.multiFilteredRowData
    ? store.multiFilteredRowData
    : store.data;
    store?.csv?.splice(1);
  if (type === "tableF" && store.groupsFiltered && store.groupKeysFiltered) {
    cols = Object.keys(store.groupsFiltered[store.groupKeysFiltered[0]] || {});
    store.rows = store.groupKeysFiltered
      .filter((r) =>
        JSON.stringify(store.groupsFiltered ? store.groupsFiltered[r] : [])
          .toLowerCase()
          .includes(phrase),
      )
      .map((rowStr) => RowF({ rowStr, cols }));
  } else {
    cols = getColumns(store.data);
    store.rows = theData
      .filter((r) => JSON.stringify(r).toLowerCase().includes(phrase))
      .map((row) => Row({ row, cols }));
  }

  store.clusterize?.update(store.rows);

  refreshGroups();
  if (store.activeTab === "ai") {
    renderAiTab(true);
  }

  store.changes && (await postData(`${URL}&save=true`, store.changes));
  if (shouldSave) {
    const btn = document.querySelector("button.btn") as HTMLButtonElement;
    if (!btn) return;
    btn.innerText = "Save";
    btn.classList.remove("btn--hidden");
  }
};
