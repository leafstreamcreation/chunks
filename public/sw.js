self.importScripts("/localforage.min.js");
self.importScripts("/odm.js");

const textEncoder = new TextEncoder();
const db = ODM(); // eslint-disable-line

const BASE_URL_ACTIVITY = "https://localhost:5051/activity/";
const BASE_URL_BACKEND = "";

const updatePool = [];
let updateInterval;

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

  async function loginHandler(request) {
    const body = await request.clone().json();
    const encoder = new TextEncoder();
    const init = {
      method: "POST",
      body: encoder.encode(JSON.stringify(body)),
    };
    if (!("name" in body))
      return Promise.resolve(response(400, { message: "name is required" }));
    if (!("password" in body))
      return Promise.resolve(
        response(400, { message: "password is required" })
      );
    if ("ticket" in body) {
      const signupRoute = [BASE_URL_BACKEND, "/signup"].join();
      const res = await fetch(signupRoute, init);

      //signup ok; return signup success
      if (res.status === 200) {
        const data = await res.json();
        //begin batch update loop
        updateInterval = setInterval(exportUpdates, 1800000);
        //forward response to client
        return Promise.resolve(response(200, data));
      }
      //signup bad; respond based on failure code
      //server error
      else if (res.status === 500)
        return Promise.resolve(response(500, { message: "server error" }));
      //invalid ticket
      else if (res.status === 403) {
        const data = await res.json();
        //is ticket refund or invalid ticket?
        return Promise.resolve(response(403, { message: data.message }));
      }
      //missing ticket/credentials
      else if (res.status === 400)
        return Promise.resolve(
          response(400, { message: "ticket, username, and password required" })
        );
      else return Promise.resolve(response(500, { message: "server error" }));
    } else {
      //call the login route
      const loginRoute = [BASE_URL_BACKEND, "/login"].join();
      const res = await fetch(loginRoute, init);
      //login ok; return login success
      if (res.status === 200) {
        const data = await res.json();
        //begin batch update loop
        updateInterval = setInterval(exportUpdates, 1800000);
        //forward response to client
        return Promise.resolve(response(200, data));
      }
      //login bad; respond based on failure code
      //server error
      else if (res.status === 500)
        return Promise.resolve(response(500, { message: "server error" }));
      //missing credentials
      else if (res.status === 400)
        return Promise.resolve(
          response(400, { message: "username and password required" })
        );
      //invalid credentials
      else if (res.status === 403) {
        const data = await res.json();
        //is expired login or invalid credentials?
        return Promise.resolve(response(403, { message: data.message }));
      } else return Promise.resolve(response(500, { message: "server error" }));
    }
  }

  async function logoutHandler() {
    await db.dropDB();
    await db.init();
    return Promise.resolve(response(200, { message: "cleared all user data" }));
  }

  async function exportUpdates() {}

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
