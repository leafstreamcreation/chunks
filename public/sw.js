console.log("beep");
console.log("service worker 2");

self.addEventListener('fetch', (event) => {
    console.log("FETCH!");
});