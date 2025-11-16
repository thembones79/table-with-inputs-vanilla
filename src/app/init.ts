import { getData, URL } from "./api";

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
  data?: ExerciseEntry[];
  payload?: string;
  decimal: "." | ",";
};

export const store: TStore = {
  data: undefined,
  decimal: ",",
  payload: undefined,
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

function handleSave() {
  document.getElementById("save-btn")?.addEventListener("click", () => {
    updatePayload();
    console.log("Aktualny payload:", store.payload);
    alert("Payload zapisany:\n" + store.payload);
  });
}

function renderExerciseTable(data: ExerciseEntry[]): string {
  const html = `
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
    <button id="save-btn" style="margin-top: 1rem; padding: 0.5rem 1rem;">Save</button>
  `;
  return html;
}

export const initApp = async () => {
  store.data = await getData(`${URL}&get=glTable`);
  const app = document.getElementById("app") as HTMLDivElement;
  if (!store.data) return;
  app.outerHTML = renderExerciseTable(store.data);
  createInitialPayload(store.data);
  console.log("init payload", store.payload);
  handleInput();
  handleSave();
};
