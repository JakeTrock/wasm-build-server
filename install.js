//https://github.com/emscripten-core/emsdk/archive/master.zip

const fetch = require("node-fetch");
const AdmZip = require("adm-zip");
const child_process = require("child_process");
const path = require("path");

let emsdkUrl = "https://github.com/emscripten-core/emsdk/archive/master.zip";
let unzippedDest = "./emsdk";

console.log("Fetching emsdk");
fetch(emsdkUrl).then((resp)=>{
    resp.buffer().then((buf)=>{
        console.log("Decompressing");
        let zipped = new AdmZip(buf);
        let entries = zipped.getEntries();
        let master = zipped.getEntry("emsdk-master/");

        console.log("Decompressing", master.entryName);
        zipped.extractEntryTo(master, unzippedDest, false, true);

        console.log("Installing emsdk");

        let executablePath = path.join(__dirname, unzippedDest);

        child_process.exec("emsdk install latest", {
            cwd:executablePath
        }, (ex, out, err)=>{
            if (!ex && !err) {
                console.log("Activating emsdk");

                child_process.exec("emsdk activate latest", {
                    cwd:executablePath
                }, (ex1, out1, err1)=>{
                    if (!ex1 && !err1) {
                        console.log("Finished installing/activating emsdk!");
                    } else {
                        console.log("Uh oh..", ex1, err1);
                    }
                }).stdout.on("data", (data)=>{
                    console.log(data);
                });

            } else {
                console.log("Un oh..", ex, err);
            }

        }).stdout.on("data", (data)=>{
            console.log(data);
        });

    }).catch((reason)=>{
        console.log("Response -> ArrayBuffer failed", reason);
    });
}).catch((reason)=>{
    console.log("Fetch failed", reason);
});

console.log("Finished installing emsdk");
