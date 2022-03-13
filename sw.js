self.importScripts("/node_modules/localforage/dist/localforage.js");

const textEncoder = new TextEncoder();

const STATE_LAST_ID = "latestId";
const STATE_IDS = "ids";

const lf = {
  getLatestId: () =>
    localforage.getItem(STATE_LAST_ID).catch((error) => {
      console.log(
        "CTD: I was fetching store latestId and this happened ",
        error
      );
    }),
  setLatestId: (newId) =>
    localforage.setItem(STATE_LAST_ID, newId).catch((error) => {
      console.log(
        "CTD: I was setting store latestId and this happened ",
        error
      );
    }),
  getIds: () =>
    localforage.getItem(STATE_IDS).catch((error) => {
      console.log("CTD: I was fetching store ids and this happened ", error);
    }),
  setIds: (newIds) =>
    localforage.setItem(STATE_IDS, newIds).catch((error) => {
      console.log("CTD: I was setting store ids and this happened ", error);
    }),
  getActivity: (id) =>
    localforage.getItem(`${id}`).catch((error) => {
      console.log("CTD: I was fetching an activity and this happened ", error);
    }),
  setActivity: (data) =>
    localforage.setItem(`${data.id}`).catch((error) => {
      console.log("CTD: I was saving an activity and this happened ", error);
    }),
};

self.addEventListener("activate", (event) => {
  const activateHandler = async () => {
    const stateId = await lf.getLatestId();
    if (stateId === null) {
      lf.setLatestId(0);
      lf.setIds({});
      console.log("Activating: state initialized", { latestId: 0, ids: {} });
    } else console.log("Activating: prior state detected");
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
