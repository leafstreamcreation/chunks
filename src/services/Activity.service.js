const baseURL = import.meta.env.VITE_REMOTE_STORAGE;

export default async function activityService(
  path = "index",
  post = false,
  body = null
) {
  const fullPath = [baseURL, "/activity/", path].join("");
  const init = {};
  init.method = post ? "POST" : "GET";
  if (body) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(body));
    init.body = data;
  }
  const res = await fetch(fullPath, init).catch((error) => {
    console.log(error);
  });
  return res.json();
}
