import { type ExerciseEntry } from "./store";
import { formatDecimal } from "./data-transformers";

export function handleLocked(locked?: boolean) {
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

export function renderTable(data: ExerciseEntry[]): string {
  const html = `
<div id="the-app">
    <table id="data-table" border="1" cellpadding="5" cellspacing="0">
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
                <td><input type="text" value="${formatDecimal(entry.calories_burned)}" /></td>
                <td><input type="text" value="${formatDecimal(entry.heart_rate_avg)}"  /></td>
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

export function renderModal(message: string, type: "error" | "success") {
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

export function closeModal() {
  document
    .getElementById("close-btn")
    ?.removeEventListener("click", closeModal);
  const modal = document.getElementById("modal-wrapper") as HTMLDivElement;
  modal.innerHTML = "";
}
