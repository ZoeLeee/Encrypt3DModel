self.addEventListener("install", (event) => {
  console.log("installing");
});

self.addEventListener("activate", (event) => {
  console.log("activating");
});

const finish = () => {};
const decrypt = (v) => {};

self.addEventListener("fetch", function (event: any) {
  event.respondWith(
    (async function () {
      const url = event.request.url;
      if (event.request.url.endsWith(".glb")) {
        const response = await fetch(event.request);
        if (response.status !== 200) return response;
        const reader = response.body.getReader();
        const stream = new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                console.log("value: ", value);
                if (done) {
                  controller.close();
                  finish(url);
                  return;
                }
                if (event.request.referrer)
                  controller.enqueue(decrypt(value, url));
                else controller.enqueue(value);
                push();
              });
            }

            push();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=Xbot.glb",
            "Content-Transfer-Encoding": "binary",
          },
        });
      } else {
        return fetch(event.request);
      }
    })()
  );
});
