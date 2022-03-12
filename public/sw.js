const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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
    return Promise.resolve(response());
  }
  
  async function indexHandler() {
    console.log("index requested");
    return Promise.resolve(response());
  }

  async function updateHandler(id, request) {
    const body = await request.clone().json();
    console.log("update requested", id, body);
    return Promise.resolve(response());
  }

  async function deleteHandler(id) {
    console.log("delete requested", id);
    return Promise.resolve(response());
  }
  
  function response() {
    const buffer = textEncoder.encode(`{ "url": "${url}" }`);
    const response = new Response(buffer, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
      statusText: "OK",
    });
    return response;
  }
});
