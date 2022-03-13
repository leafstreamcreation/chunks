self.importScripts("/node_modules/localforage/dist/localforage.js");

const textEncoder = new TextEncoder();

const STATE_LAST_ID = "id";
const STATE_ACTIVITIES = "activities";

self.addEventListener("activate", (event) => {
  console.log("ACTIVATE");
  event.waitUntil(
    localforage.getItem(STATE_LAST_ID).then((id) => {
      if (id === null) return localforage.setItem(STATE_LAST_ID, 0)
    }).then((value) => {
      console.log("id state initialized: ", value);
      return localforage.setItem(STATE_ACTIVITIES, {});
    }).then((value) => {
      console.log("activity store intitialized: ", value);
    }).catch(error => {
      console.log("CTD: ", error);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.startsWith("https://remote-storage-name.herokuapp.com/activity/")) {
    console.log("hasBody? ", event.request);
    if (url.endsWith("delete")) {
      const id = url.slice(51).split("/")[0];
      event.respondWith(deleteHandler(id));
    } else if (url.endsWith("index")) {
      event.respondWith(indexHandler());
    } else if (url.endsWith("update")) {
      const id = url.slice(51).split("/")[0];
      event.respondWith(updateHandler(id, event.request));
    } else if (url.endsWith("create")) {
      event.respondWith(createHandler(event.request));
    } else console.log("CTD: Route does not exist");
  }
  
  async function createHandler(request) {
    const body = await request.clone().json();
    console.log("create requested", body);
    return Promise.resolve(response(200, { url: url }));
  }
  
  async function indexHandler() {
    console.log("index requested");
    return Promise.resolve(response(200, { url: url }));
  }

  async function updateHandler(id, request) {
    const body = await request.clone().json();
    console.log("update requested", id, body);
    return Promise.resolve(response(200, { url: url }));
  }

  async function deleteHandler(id) {
    console.log("delete requested", id);
    return Promise.resolve(response(200, { url: url }));
  }
  
  function response(status, data) {
    const buffer = textEncoder.encode(JSON.stringify(data));
    const response = new Response(buffer, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      status,
      statusText: "OK",
    });
    return response;
  }
});
