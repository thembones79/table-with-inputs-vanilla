import { renderLoader, closeLoader } from "./renderers";
const host = document.querySelector("body")?.dataset?.url || null;
export const params = window.location.search;
export const URL = host ? host + params : window.location.href;

export async function getData<T>(url: string) {
  renderLoader();
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    console.error(error.message);
  } finally {
    closeLoader();
  }
}
export async function postData(url: string, body: Record<string, any>) {
  renderLoader();
  const formData = new FormData();
  formData.append("json", JSON.stringify(body));
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error.message);
    return { error };
  } finally {
    closeLoader();
  }
}
