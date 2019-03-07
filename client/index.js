const bcrypt = dcodeIO.bcrypt;
const apiUrl = "http://localhost/Node/wasm-build-server/api";//"https://wasm.jonathancrowder.com/api";

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

//https://stackoverflow.com/questions/29775797/fetch-post-json-data
const login = (email, pass, cb)=> {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(pass, salt);

    let payload = new FormData();
    payload.append("type", "login");
    payload.append("email", email);
    payload.append("pass", hash);

    fetch(urlWithArgs(apiUrl, {
        type:"login",
        email:email,
        pass:hash
    })).then((response)=>{
        response.json().then(cb);
    });
}

let cookie = getCookie("wasm-frontend-user-cookie");

if (cookie !== "") {
    console.log("Already had cookie!", cookie);
} else {
    login("dev@jonathancrowder.com", "apassword", (response)=>{
        setCookie("wasm-frontend-user-cookie", response["wasm-frontend-user-cookie"]);
        console.log(response);
    });
}
