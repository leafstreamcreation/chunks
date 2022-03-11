const textEncoder = new TextEncoder();

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.startsWith("https://remote-storage-name.herokuapp.com/activity/")) {
    if (url.endsWith("delete")) {
      console.log("delete requested");
    } else if (url.endsWith("index")) {
      console.log("index requested");
    } else if (url.endsWith("update")) {
      console.log("update requested");
    } else if (url.endsWith("create")) {
      console.log("create requested");
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
});
