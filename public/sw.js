self.importScripts("/localforage.min.js");
self.importScripts("/odm.js");

const textEncoder = new TextEncoder();
const db = ODM(); // eslint-disable-line

const BASE_URL_ACTIVITY = "https://localhost:5051/activity/";

// const batchUpdate = [];

//how to incorporate crypto now that crypto-js is deprecated?

//how to load from the backend to service worker?

self.addEventListener("install", (event) => {
  event.waitUntil(db.init());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim()); // eslint-disable-line
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.startsWith(BASE_URL_ACTIVITY)) {
    if (url.endsWith("delete")) {
      const id = url.slice(BASE_URL_ACTIVITY.length).split("/")[0];
      event.respondWith(deleteActivityHandler(id));
    } else if (url.endsWith("index")) {
      event.respondWith(indexActivityHandler());
    } else if (url.endsWith("update")) {
      const id = url.slice(BASE_URL_ACTIVITY.length).split("/")[0];
      event.respondWith(updateActivityHandler(id, event.request));
    } else if (url.endsWith("create")) {
      event.respondWith(createActivityHandler(event.request));
    } else if (url.endsWith("login")) {
      event.respondWith(loginHandler(event.request));
    } else if (url.endsWith("logout")) {
      event.respondWith(logoutHandler(event.request));
    } else console.log("CTD: Route does not exist");
  }

  async function createActivityHandler(request) {
    const body = await request.clone().json();
    if (!("name" in body))
      return Promise.resolve(response(400, { message: "name is required" }));
    if (!("group" in body))
      return Promise.resolve(response(400, { message: "group is required" }));
    const newActivity = await db.createActivity(body);
    //prepare update to be sent to backend
    return Promise.resolve(response(200, { activity: newActivity }));
  }

  async function indexActivityHandler() {
    const unsortedActivities = await db.indexActivity();
    const sortedActivities = {};
    for (const activity of unsortedActivities) {
      const groupKey = `${activity.group}`;
      if (!(groupKey in sortedActivities)) sortedActivities[groupKey] = [];
      sortedActivities[groupKey].push(activity);
    }
    const responseActivities = Object.values(sortedActivities).sort(
      (a, b) => a[0].group - b[0].group
    );
    return Promise.resolve(
      response(200, { activitiesByGroup: responseActivities })
    );
  }

  async function updateActivityHandler(id, request) {
    const body = await request.clone().json();
    if (!(body.name || body.startDate || body.endDate))
      return Promise.resolve(response(400, { message: "name is required" }));
    const updatedActivity = await db.updateActivity(id, body);
    //prepare update to be sent to backend
    return Promise.resolve(response(200, { activity: updatedActivity }));
  }

  async function deleteActivityHandler(id) {
    const deletedActivity = await db.deleteActivity(id);
    //prepare update to be sent to backend
    return Promise.resolve(response(200, { activity: deletedActivity }));
  }

  async function loginHandler(/*request*/) {
    //is signup or login?
    //send to backend
    //begin batch update loop
    //forward response to client
  }

  async function logoutHandler() {
    await db.dropDB();
    await db.init();
    return Promise.resolve(response(200, { message: "cleared all user data" }));
  }

  function response(status, data) {
    console.log("API: ", status, data);
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
