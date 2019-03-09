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

const login = (email, pass, cb)=> {
    fetch(urlWithArgs(apiUrl, {
        type:"login",
        email:email,
        pass:pass
    })).then((response)=>{
        response.json().then(cb);
    });
}

const logout = ()=>{
    removeCookie("wasm-frontend-user-cookie");
}

const details = (cookie, cb)=>{
    fetch(urlWithArgs(apiUrl, {
        type:"details",
        "wasm-frontend-user-cookie":cookie
    })).then((response)=>{
        response.json().then(cb);
    })
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

if (iEmail.value == "") {
    iEmail.value = "demo@email.com";
}
if (iPass.value == "") {
    iPass.value = "apassword";
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

                details(getCookie("wasm-frontend-user-cookie"), (data)=>{
                    console.log(data);
                    sUserName.textContent = "Welcome, " + data.details.display;
                    iEmail.style.display = "none";
                    iPass.style.display = "none";
                    bLoginout.textContent = "Logout";
                });
            }
        });
    }
});

if (isLoggedIn()) {
    details(getCookie("wasm-frontend-user-cookie"), (data)=>{
        console.log(data);
        sUserName.textContent = "Welcome, " + data.details.display;
        iEmail.style.display = "none";
        iPass.style.display = "none";
        bLoginout.textContent = "Logout";
    });
}
