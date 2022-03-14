self.importScripts("/node_modules/localforage/dist/localforage.js");
self.importScripts("/odm.js");

const textEncoder = new TextEncoder();
const db = ODM();

self.addEventListener("activate", (event) => {
  const activateHandler = async () => {
    await db.init();
    //seed here
    return Promise.resolve();
  };
  event.waitUntil(activateHandler());
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.startsWith("https://remote-storage-name.herokuapp.com/activity/")) {
    if (url.endsWith("delete")) {
      const id = url.slice(51).split("/")[0];
      event.respondWith(deleteActivityHandler(id));
    } else if (url.endsWith("index")) {
      event.respondWith(indexActivityHandler());
    } else if (url.endsWith("update")) {
      const id = url.slice(51).split("/")[0];
      event.respondWith(updateActivityHandler(id, event.request));
    } else if (url.endsWith("create")) {
      event.respondWith(createActivityHandler(event.request));
    } else console.log("CTD: Route does not exist");
  }

  async function createActivityHandler(request) {
    const body = await request.clone().json();
    console.log("create requested", body);
    // take in name and group
    // get the latest id
    // initialize history object
    // set id, name, group, history, save and respond
    return Promise.resolve(response(200, { url: url }));
  }

  async function indexActivityHandler() {
    console.log("index requested");
    return Promise.resolve(response(200, { url: url }));
  }

  async function updateActivityHandler(id, request) {
    const body = await request.clone().json();
    console.log("update requested", id, body);
    return Promise.resolve(response(200, { url: url }));
  }

  async function deleteActivityHandler(id) {
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
