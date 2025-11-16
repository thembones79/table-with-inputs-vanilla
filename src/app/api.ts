const host = document.querySelector("body")?.dataset?.url || null;
export const params = window.location.search;
//const pathname = window.location.pathname;
export const URL = host ? host + params : window.location.href;

const ERROR_MESSAGE =
  "Ups something went wrong... on BACK END! Please login and refresh the app. If the issue would last longer than 15 minutes, please report it to trash@siemens.com";

const setError = () => {
  const content = document.querySelector(".tab__content") as HTMLDivElement;

  if (content) {
    content.setAttribute("inert", "true");
  }
};

const removeError = () => {
  const content = document.querySelector(".tab__content") as HTMLDivElement;
  console.log({ content, ERROR_MESSAGE });

  // if (content && !store.locked) {
  //   content.removeAttribute("inert");
  // }
};

export async function getData<T>(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    // store.error = undefined;
    // removeError();
    return data as T;
  } catch (error: any) {
    // store.error = ERROR_MESSAGE;
    setError();
    console.error(error.message);
  }
}
export async function postData(url: string, body: Record<string, any>) {
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
    // store.error = undefined;
    removeError();
    return data;
  } catch (error: any) {
    // store.error = ERROR_MESSAGE;
    setError();
    console.error(error.message);
    return { error };
  }
}
