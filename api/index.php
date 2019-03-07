<?php
error_reporting(0);

header("Content-Type: application/json");

$result = new \stdClass();

$reqType = $_GET["type"];

if ($reqType == "login") {
    if (password_verify("apassword", $_GET["pass"])) {
        $result->status = "success";
        $result->{"wasm-frontend-user-cookie"} = "test1";
    } else {
        $result->status = "failed";
    }
}

//$result->args = $_GET;

die(json_encode($result));
?>