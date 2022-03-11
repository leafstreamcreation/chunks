const baseURL = import.meta.env.VITE_REMOTE_STORAGE;

export default async function activityService(
  path = "index",
  post = false,
  body = null
) {
  const fullPath = [baseURL, "/activity/", path].join("");
  const res = await fetch(fullPath).catch((error) => {
    console.log(error);
  });
  return res.json();
}
