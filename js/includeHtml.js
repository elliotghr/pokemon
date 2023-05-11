export const getHtml = async () => {
  try {
    let res = await fetch(`./header.html`);
    if (!res.ok)
      throw {
        status: res.status,
        statusText: res.statusText,
      };
    let html = await res.text();
    document.querySelector("header").outerHTML = html;
  } catch (error) {
    console.log(error);
  }
};
