import { store, type ExerciseEntry } from "./store";

export function formatDecimal(value: number): string {
  return store.decimal === ","
    ? value.toString().replace(".", ",")
    : value.toString();
}

export function parseDecimal(input: string): number {
  const normalized = store.decimal === "," ? input.replace(",", ".") : input;
  return parseFloat(normalized) || 0;
}

export function sanitizeInputLive(input: string): string {
  const decimal = store.decimal;
  const allowedChars = decimal === "," ? /[^0-9,-]/g : /[^0-9.-]/g;
  let sanitized = input.replace(allowedChars, "");

  const parts = sanitized.split(decimal);
  if (parts.length > 2) {
    sanitized = parts[0] + decimal + parts.slice(1).join("");
  }

  return sanitized;
}

export function createInitialPayload(data: ExerciseEntry[]) {
  const head = "calories_burned,heart_rate_avg|";
  const values = data
    .map((el) => `${el.calories_burned},${el.heart_rate_avg}`)
    .join("|");
  store.payload = `${head}${values}`;
}

export function updatePayload() {
  const table = document.getElementById("data-table");
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
