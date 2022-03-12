const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.startsWith("https://remote-storage-name.herokuapp.com/activity/")) {
    if (url.endsWith("delete")) {
      const id = url.slice(51).split("/")[0];
      console.log("delete requested", id);
    } else if (url.endsWith("index")) {
      console.log("index requested");
    } else if (url.endsWith("update")) {
      const id = url.slice(51).split("/")[0];
      const body = parseBody(event.request);
      console.log("update requested", id, body);
    } else if (url.endsWith("create")) {
      const body = parseBody(event.request);
      console.log("create requested", body);
    } else console.log("CTD: Route does not exist");
    const buffer = textEncoder.encode(`{ "url": "${url}" }`);
    const response = new Response(buffer, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
      statusText: "OK",
    });
    event.respondWith(response);
    // const wait = new Promise((resolve) => { setTimeout(resolve, 1000, response) }).then((res) => {
    //     console.log(event.request.method, url);
    //     event.respondWith(res);
    // });
    // event.waitUntil(wait);
  }

  function parseBody(request) {
    const { body } = request;
    console.log(body);
    if (!body) return null;
    return body ? JSON.parse(textDecoder.decode(body)) : null;
  }
});
