<?php
error_reporting(0);

function getRandomHex($num_bytes=4) {
    return bin2hex(openssl_random_pseudo_bytes($num_bytes));
}

header("Content-Type: application/json");

$result = new \stdClass();

$reqType = $_GET["type"];

if ($reqType == "login") {
    if (password_verify("apassword", $_GET["pass"])) {
        $result->status = "success";
        $result->{"wasm-frontend-user-cookie"} = getRandomHex(12);
    } else {
        $result->status = "failed";
    }
}

die(json_encode($result));
?>