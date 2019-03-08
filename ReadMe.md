# wasm-build-server
emsdk wants subsystem for linux? NAH. How about a build server!<br />
Cause that's not overkill at all.

For the developer it is a nice way for multiple users to manage and schedule
builds of their WebAssembly projects.

Think Expo, but tiny and for WebAssembly emsdk projects.
https://wasm.jonathancrowder.com/client

## Installing
First you need the software on your machine:

`git clone https://github.com/RepComm/wasm-build-server.git`


Change directories:
`cd wasm-build-server`

Install dependencies:
`npm install`

## Running
`npm start`
> $ npm start
> 
> wasm-build-server@1.0.0 start ... \wasm-build-server
> node index.js
> 
> [wasm-build-server] restful api operating on port 80

## Creating A Project with rest API:

`localhost/?type=create&name=some+project+name`

Responds with project data information that will identify the project even before
the server is done configuring it.

```json
{
    "status":"success",
    "desc":"Creating project",
    "projectData":{
        "name":"some project name",
        "id":"513e55ea6472b95d2423a44fa97f5e"
    }
}
```

The id is what will be used to uniquely identify the project, even when there are projects with the same name.

Future access to the project will be by supplying the project's id.


I think I want to store the projects in a mysql database instead of writting directly to disk.

I feel like this will be easier to secure. Ideally there would be multiple independent users with credentials.