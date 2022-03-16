self.importScripts("/localforage.min.js");
self.importScripts("/odm.js");

const textEncoder = new TextEncoder();
const db = ODM();

self.addEventListener("install", (event) => {
  event.waitUntil(db.init());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
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
    if (!("name" in body))
      return Promise.resolve(response(400, { message: "name is required" }));
    if (!("group" in body))
      return Promise.resolve(response(400, { message: "group is required" }));
    const newActivity = await db.createActivity(body);
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
    return Promise.resolve(response(200, { activity: updatedActivity }));
  }

  async function deleteActivityHandler(id) {
    const deletedActivity = await db.deleteActivity(id);
    return Promise.resolve(response(200, { activity: deletedActivity }));
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
