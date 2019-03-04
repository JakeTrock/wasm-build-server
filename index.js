/**
 * @author Jonathan Crowder
 * Main server code for web assembly build server
 */

//https://webassembly.org/getting-started/developers-guide/

const http = require("http");
const fs = require("fs");
const path = require("path");

//Desired path for projects to be located, may not exist
const projectsPath = path.join(__dirname, "projects");

/** Create a map of key:value from an http url
 * @param {String} url to parse
 * @returns {Map} key value map of url parameters
 */
function getParamsFromUrl(url) {
    url = url.replace("+", " ");
    let start = url.indexOf("?");
    if (start === -1) return {};
    let result = {};

    let params = url.substring(start + 1).split("&");
    let param, ind;
    for (let i = 0; i < params.length; i++) {
        param = params[i];
        ind = param.indexOf("=");
        if (ind !== -1) {
            result[param.substring(0, ind)] = param.substring(ind + 1);
        } else {
            result[param] = "";
        }
    }
    return result;
}

/** Make a random hexadecimal string
 * @param {Integer} length in bytes of string
 * @returns {String} hex string with size 2*length in chars
 */
function getRandHexString(length = 16) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += parseInt((Math.random() * 256)).toString(16);
    }
    return result;
}

/** Create a wasm-build-server project
 * @param {Object} projectData project config information
 * Do not invoke this yourself! Internal use only!
 */
function createProject(projectData) {
    if (!fs.existsSync(projectsPath)) {
        fs.mkdirSync(projectsPath);
    }
    fs.mkdir(path.join(projectsPath, projectData.id), (err)=>{
        if (err) {
            console.error(err);
        } else {
            console.log("Successfully created project", projectData.id);
        }
    });
}

/** Abstracted response crafting/handling, should be renamed?
 * @param {Map} params url parameters pre-parsed into a key:value map
 */
function craftResponse(params) {
    let result = {
        status: "undefined"
    };
    if (!params.type) {
        result.status = "failed";
    } else {
        switch (params.type) {
            case "create":
                if (params.name) {
                    let projectData = {
                        name:params.name,
                        id:getRandHexString()
                    };
                    createProject(projectData);

                    result.status = "success";
                    result.desc = "Creating project";
                    result.projectData = projectData;
                }
                break;
            default:
                result.status = params.type + " is not implemented yet";
                break;
        }
    }
    return result;
}

//Create the server, listen for events, and listen/start on port 80
let httpServer = http.createServer((req, resp) => {
    console.log(req.url);
    //Response to client should be in JSON
    resp.setHeader("Content-Type", "application/json");

    //Craft our response
    let responseJson = craftResponse(getParamsFromUrl(req.url), resp);

    //Finish up and send to the client, closing the connection
    resp.end(JSON.stringify(responseJson));

}).on("close", () => {
    console.log("Closed");
}).on("connection", (socket) => {
    console.log("Connection");
}).on("error", (err) => {
    console.error(err);
}).on("listening", () => {
    console.log("[wasm-build-server] restful api operating on port 80");
}).listen(80);
