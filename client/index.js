//Get our url
let apiUrl = window.location.href;
//Remove trailing / if it exists
if (apiUrl.charAt(apiUrl.length-1) == "/") {
    apiUrl = apiUrl.substring(0, apiUrl.length-1);
}
//Remove current file and replace with /api
apiUrl = apiUrl.substring(0, apiUrl.lastIndexOf("/")) + "/api";
console.log(apiUrl);

const setCookie = (key, val, expDate)=> {
    if (!expDate) {
        expDate = new Date();
        expDate.setTime(expDate.getTime() + 86400000); //In the future 24 hours
    }
    document.cookie = key + "=" + val + ";" + expDate.toUTCString(); + ";path=/";
}

const removeCookie = (key)=> {
    let d = new Date();
    d.setTime(0);
    console.log(d);
    setCookie(key, "", d);
}

const getCookie = (key)=> {
    let entries = document.cookie.split(";");
    for (let i=0; i<entries.length; i++) {
        //Remove beginning whitespace if it exists
        let start = 0;
        for (let j=0; j<entries[i].length; j++) {
            if (entries[i].charAt(j) !== " ") {
                start = j;
                break;
            }
        }
        if (start > 0) {
            entries[i] = entries[i].substring(start);
        }
        start = entries[i].indexOf("=");
        if (start !== -1) {
            //console.log(entries[i].substring(0, start), entries[i].substring(start+1));
            if (entries[i].substring(0, start) === key) {
                return entries[i].substring(start+1);
            }
        } else {
            continue;
        }
    }
    return "";
}

/** Combine url with arguments
 * @param {String} url to use
 * @param {Map} args to parse
 */
const urlWithArgs = (url, args)=> {
    let keys = Object.keys(args);
    let key, val;
    let appendStr = "";
    for (let i=0; i<keys.length; i++) {
        key = keys[i];
        val = args[key];
        if (typeof(val) !== "string") val = val.toString();

        if (i === 0 && url.indexOf("?") === -1) {
            appendStr += "?" + key + "=" + val;
        } else {
            appendStr += "&" + key + "=" + val;
        }
    }
    return url + appendStr;
}

/** Login using email and password
 * @param {String} email of user
 * @param {String} pass of user
 * @param {Function} cb callback
 */
const login = (email, pass, cb)=> {
    fetch(urlWithArgs(apiUrl, {
        type:"login",
        email:email,
        pass:pass
    })).then((response)=>{
        response.json().then(cb);
    });
}

/** Logout, deleting the user cookie
 */
const logout = ()=>{
    removeCookie("wasm-frontend-user-cookie");
}

/** Get details of a user using their cookie
 * @param {String} cookie of user
 * @param {Function} cb callback
 */
const details = (cookie, cb)=>{
    fetch(urlWithArgs(apiUrl, {
        type:"details",
        "wasm-frontend-user-cookie":cookie
    })).then((response)=>{
        response.json().then(cb);
    });
}

/** Fetch all projects data of a profile
 * @param {Integer} owner id of projects to fetch
 * @param {Function} cb callback
 */
const projectList = (owner, cb) => {
    fetch(urlWithArgs(apiUrl, {
        type:"projects-list",
        owner:owner
    })).then((response)=>{
        response.json().then(cb);
    });
}

const createProj = (name, fetchurl, description, cb)=>{
    fetch(urlWithArgs(apiUrl, {
        type:"project-create",
        name:name,
        fetchurl:fetchurl,
        description:description,
        "wasm-frontend-user-cookie":getCookie("wasm-frontend-user-cookie")
    })).then((response)=>{
        response.json().then(cb);
    });
}

let cookie = getCookie("wasm-frontend-user-cookie");

let get = (id)=>document.getElementById(id);
let on = (e, type, cb, opts) => e.addEventListener(type, cb, opts);

let isLoggedIn = ()=>{
    let c = getCookie("wasm-frontend-user-cookie");
    return c !== "" && c !== "undefined";
}

let sUserName = get("username");
let bLoginout = get("loginout");
let iEmail = get("email");
let iPass = get("pass");
let dProjects = get("projects");

if (iEmail.value == "") {
    iEmail.value = "demo@email.com";
}
if (iPass.value == "") {
    iPass.value = "apassword";
}

let onLogin = ()=>{
    details(getCookie("wasm-frontend-user-cookie"), (data)=>{
        console.log(data);
        sUserName.textContent = "Welcome, " + data.details.display;
        iEmail.style.display = "none";
        iPass.style.display = "none";
        bLoginout.textContent = "Logout";

        projectList(data.details.id, (data0)=>{
            let proj;
            for (let i=0; i<data0.projects.length; i++) {
                proj = data0.projects[i];
                
                let dProj = document.createElement("div");
                dProj.className = "project";

                let sTitle = document.createElement("span");
                sTitle.className = "project-title";
                sTitle.textContent = proj.name;
                dProj.appendChild(sTitle);

                let sDesc = document.createElement("span");
                sDesc.className = "project-desc";
                sDesc.textContent = proj.description;
                sDesc.id = "p-" + proj.id;
                dProj.appendChild(sDesc);
                
                dProjects.appendChild(dProj);
            }
        });
    });
}

on(bLoginout, "click", ()=>{
    if (isLoggedIn()) {
        logout();
        iEmail.style.display = "unset";
        iPass.style.display = "unset";
        sUserName.textContent = "Not logged in";
        bLoginout.textContent = "Login";
    } else {
        login(iEmail.value, iPass.value, (resp)=>{
            if (resp.status === "success") {
                setCookie("wasm-frontend-user-cookie", resp["wasm-frontend-user-cookie"]);
                console.log(resp);

                onLogin();
            }
        });
    }
});

on(get("project-create-submit"), "click", ()=>{
    createProj(
        get("project-create-name").value,
        get("project-create-fetchurl").value,
        get("project-create-description").value,
        (data)=>{
            console.log(data);
            
            setTimeout(()=>{
                get("project-create-page").style.visibility = "hidden";
            }, 1500);
        }
    );
});

on(get("project-create-cancel"), "click", ()=>{
    get("project-create-page").style.visibility = "hidden";
});

on(get("project-add-button"), "click", ()=>{
    get("project-create-page").style.visibility = "visible";
});

if (isLoggedIn()) {
    onLogin();
}
