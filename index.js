/**
 * @author Jonathan Crowder
 * Main server code for web assembly build server
 */

//https://webassembly.org/getting-started/developers-guide/

const http = require("http");
const fs = require("fs");
const path = require("path");

const projectsPath = path.join(__dirname, "projects");

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

function getRandHexString(length = 16) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += parseInt((Math.random() * 256)).toString(16);
    }
    return result;
}
//console.log("Random hex 16", getRandHexString(16));

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

function craftResponse(params, resp) {
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

let httpServer = http.createServer((req, resp) => {
    console.log(req.url);
    resp.setHeader("Content-Type", "application/json");

    let responseJson = craftResponse(getParamsFromUrl(req.url), resp);

    resp.end(JSON.stringify(responseJson));

}).on("close", () => {
    console.log("Closed");
}).on("connection", (socket) => {
    console.log("Connection");
}).on("error", (err) => {
    console.error(err);
}).on("listening", () => {
    console.log("http listening");
}).listen(80);
