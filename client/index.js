//https://wasm.jonathancrowder.com/client/
const apiUrl = "https://wasm.jonathancrowder.com/api";

const setCookie = (key, val, millis)=> {
    if (!millis || millis < 1000) millis = 1000 * 60 * 60 * 12; //12 hours
    let exp = new Date();
    exp.setTime(exp.getTime() + millis);

    document.cookie = key + "=" + val + ";" + exp.toUTCString(); + ";path=/";
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
    fetch(urlWithArgs(apiUrl, {

    }), ).then((response)=>response.json().then(cb));
}

if (getCookie("wasm-frontend-user-cookie") !== "") {

}
