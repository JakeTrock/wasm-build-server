/**
 * @author Jonathan Crowder
 * @description Install script that covers everything including emsdk installation, just run and relax.
 */

const fetch = require("node-fetch"); //So we can fetch tools from online
const AdmZip = require("adm-zip"); //Decompressing zip files
const child_process = require("child_process"); //Running commands
const path = require("path"); //Non-insane file path management

//emsdk's github download link
let emsdkUrl = "https://github.com/emscripten-core/emsdk/archive/master.zip";

//desired emsdk install directory
let unzippedDest = "./emsdk";

console.log("Fetching emsdk");
fetch(emsdkUrl).then((resp)=>{
    resp.buffer().then((buf)=>{
        console.log("Decompressing");
        let zipped = new AdmZip(buf);
        let entries = zipped.getEntries();
        //Because downloading git urls creates un-needed folders
        let master = zipped.getEntry("emsdk-master/");

        console.log("Decompressing", master.entryName);
        zipped.extractEntryTo(master, unzippedDest, false, true);

        console.log("Installing emsdk");

        let executablePath = path.join(__dirname, unzippedDest);

        //Call install functionality of emsdk
        child_process.exec("emsdk install latest", {
            cwd:executablePath
        }, (ex, out, err)=>{
            if (!ex && !err) {
                console.log("Activating emsdk");

                //Call activate functionality of emsdk
                child_process.exec("emsdk activate latest", {
                    cwd:executablePath
                }, (ex1, out1, err1)=>{
                    if (!ex1 && !err1) {
                        console.log("Finished installing/activating emsdk!");
                    } else {
                        console.log("Uh oh..", ex1, err1);
                    }
                }).stdout.on("data", (data)=>{
                    //Log output from command execution to our console
                    console.log(data);
                });

            } else {
                console.log("Un oh..", ex, err);
            }

        }).stdout.on("data", (data)=>{
            //Log output from command execution to our console
            console.log(data);
        });

    }).catch((reason)=>{
        console.log("Response -> Buffer failed", reason);
    });
}).catch((reason)=>{
    console.log("Fetch failed", reason);
});

console.log("Finished installing emsdk");
