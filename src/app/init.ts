import { getData, postData, URL } from "./api";

export type ExerciseEntry = {
  id: number;
  date: string;
  exercise: string;
  reps: number;
  duration_min: number;
  achievement: string;
  calories_burned: number;
  heart_rate_avg: number;
};

export type TStore = {
  data: ExerciseEntry[];
  payload?: string;
  decimal: "." | ",";
  locked: boolean;
};

export const store: TStore = {
  data: [],
  decimal: ",",
  payload: undefined,
  locked: false,
};

const tableId = "exercise-table";

function formatDecimal(value: number): string {
  return store.decimal === ","
    ? value.toString().replace(".", ",")
    : value.toString();
}

function parseDecimal(input: string): number {
  const normalized = store.decimal === "," ? input.replace(",", ".") : input;
  return parseFloat(normalized) || 0;
}

function sanitizeInputLive(input: string): string {
  const decimal = store.decimal;
  const allowedChars = decimal === "," ? /[^0-9,-]/g : /[^0-9.-]/g;
  let sanitized = input.replace(allowedChars, "");

  const parts = sanitized.split(decimal);
  if (parts.length > 2) {
    sanitized = parts[0] + decimal + parts.slice(1).join("");
  }

  return sanitized;
}

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

function createInitialPayload(data: ExerciseEntry[]) {
  const head = "calories_burned,heart_rate_avg|";
  const values = data
    .map((el) => `${el.calories_burned},${el.heart_rate_avg}`)
    .join("|");
  store.payload = `${head}${values}`;
}

function updatePayload() {
  const table = document.getElementById(tableId);
  if (!table || !store.data) return;

  const rows = table.querySelectorAll("tbody tr");

  const values = Array.from(rows).map((row) => {
    const calories = parseDecimal(
      (row.querySelector(".calories") as HTMLInputElement)?.value || "0",
    );
    const heartRate = parseDecimal(
      (row.querySelector(".heart-rate") as HTMLInputElement)?.value || "0",
    );
    return `${calories},${heartRate}`;
  });

  store.payload = `calories_burned,heart_rate_avg|${values.join("|")}`;
}

function handleInput() {
  const table = document.getElementById(tableId);
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
    console.log("updated payload", store.payload);
  });
}

async function handleSave() {
  document.getElementById("save-btn")?.addEventListener("click", async () => {
    updatePayload();
    console.log("Aktualny payload:", store.payload);
    await onSave();
  });
}

function handleLocked(locked?: boolean) {
  const theApp = document.getElementById("the-app");
  const saveBtn = document.getElementById("save-btn");
  if (!theApp || !saveBtn) return;
  if (locked) {
    theApp.setAttribute("inert", "true");
    saveBtn.innerText = "App is locked";
    renderModal("LOK", "error");
  } else {
    theApp.removeAttribute("inert");
    saveBtn.innerText = "Save";
  }
}

function renderExerciseTable(data: ExerciseEntry[]): string {
  const html = `
<div id="the-app">
    <table id="${tableId}" border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Date</th>
          <th>Exercise</th>
          <th>Reps</th>
          <th>Duration (min)</th>
          <th>Achievement</th>
          <th>Calories Burned</th>
          <th>Heart Rate Avg</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map((entry, index) => {
            return `
              <tr data-index="${index}">
                <td>${entry.date}</td>
                <td>${entry.exercise}</td>
                <td>${entry.reps}</td>
                <td>${entry.duration_min}</td>
                <td>${entry.achievement}</td>
                <td><input type="text" value="${formatDecimal(entry.calories_burned)}" class="calories" /></td>
                <td><input type="text" value="${formatDecimal(entry.heart_rate_avg)}" class="heart-rate" /></td>
                <td class="result">${formatDecimal(entry.reps + entry.calories_burned + entry.heart_rate_avg)}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
    <button class="magic-btn" id="save-btn" style="margin-top: 1rem; padding: 0.5rem 1rem;">Save</button>
</div>
  `;
  return html;
}

export function renderLoader() {
  const html = `
      <div class="loader__wrapper">
        <div class="loader"></div>
      </div>
`;
  const loader = document.getElementById("loader-wrapper") as HTMLDivElement;
  loader.innerHTML = html;
}

export function closeLoader() {
  const loader = document.getElementById("loader-wrapper") as HTMLDivElement;
  loader.innerHTML = "";
}

function renderModal(message: string, type: "error" | "success") {
  const html = `
    <div class="modal__backdrop">
      <div class="modal">
        ${
          type === "success"
            ? ` <div class="check-container">
            <div class="check-background">
              <svg viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 25L27.3077 44L58.5 7"
                  stroke="white"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
            <div class="check-shadow"></div>
          </div>
        `
            : ""
        }

        ${
          type === "error"
            ? ` <div class="error-container">
            <div class="circle-border"></div>
            <div class="circle">
              <div class="error"></div>
            </div>
          </div>
        `
            : ""
        }

        <h2>${message}</h2>
        <button id="close-btn" class="magic-btn" >
          OK
        </button>
      </div>
    </div> `;
  const modal = document.getElementById("modal-wrapper") as HTMLDivElement;
  modal.innerHTML = html;
  document.getElementById("close-btn")?.addEventListener("click", closeModal);
}

function closeModal() {
  document
    .getElementById("close-btn")
    ?.removeEventListener("click", closeModal);
  const modal = document.getElementById("modal-wrapper") as HTMLDivElement;
  modal.innerHTML = "";
}

export const initApp = async () => {
  //@ts-ignore
  const response: TStore = await getData(`${URL}&get=glTable`);
  if (!response) return renderModal("Uuups", "error");
  const { data, locked, decimal } = response;
  store.data = data;
  store.decimal = decimal;
  const app = document.getElementById("app") as HTMLDivElement;
  console.log({ data, decimal, locked, sd: store.data });
  app.outerHTML = renderExerciseTable(store.data);
  createInitialPayload(store.data);
  console.log("init payload", store.payload);
  handleInput();
  await handleSave();
  handleLocked(locked);
};
