# wasm-build-server
A build server and user/project based authenticated web app/backend for WebAssembly projects.

Think Expo, but they know what they're doing.

This thing is a little to complicated for simple instructions right now..

I will try to write clear ones soon.


Right now you can visit the app as I work on it:
https://wasm.jonathancrowder.com/client

The API is hosted here:
https://wasm.jonathancrowder.com/api (documentation soon!)

## How does it work?
wasm-build-server at it's core is a node.js server that will build WebAssembly projects.

There is a secondary backend written in PHP and mysql, supplying a rest API (url based)<br />
to supply authenticated user/project management. <br />
This part is so that one build server can be used by many developers, and many<br />
build server instances can be used if there are lots of users scheduling builds.

The /client/ is just a simple web app that utilises the rest api, looks<br />
pretty, and is developer friendly.

## Why is this a thing?
You may know that building emsdk projects requires linux/*nix (or a subsystem linux).<br />
I have a linux server, and don't want to install a subsystem,<br />
so here we are today.

This is a huge learning thing for me, otherwise I wouldn't bother.<br />
Later on I'll write/video what I've learned.

I plan on taking this project and reusing a bunch of it for gcc and microsoft cpp compilers<br />
because I really REALLY hate trying to install them on my device, and I know<br />
everyone else hates this as well.