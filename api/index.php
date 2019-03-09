<?php
//error_reporting(0);

function getRandomHex($num_bytes=4) {
    return bin2hex(openssl_random_pseudo_bytes($num_bytes));
}

function isSecure() {
    return
      (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
      || $_SERVER['SERVER_PORT'] == 443;
}

header("Content-Type: application/json");

$dbConfig = json_decode(file_get_contents("dbconfig.json"));

$result = new \stdClass();

if (!isSecure()) {
    $result->status = "failed";
    $result->desc = "Connection is not secure!";
    die(json_encode($result));
}

if (!isset($_GET["type"])) {
    $result->status = "failed";
    $result->desc = "No 'type' parameter found!";
    die(json_encode($result));
}

$reqType = $_GET["type"];
$conn = new mysqli($dbConfig->name, $dbConfig->user, $dbConfig->pass, $dbConfig->dtbs);

if ($conn->connect_error) {
    $result->status = "failed";
    $result->connect_error = $conn->connect_error;
} else {
    switch ($reqType) {
        case "login":
        if (!isset($_GET["email"])) {
            $result->status = "failed";
            $result->desc = "No 'email' param supplied to login api";
            die(json_encode($result));
        }
        if (!isset($_GET["pass"])) {
            $result->status = "failed";
            $result->desc = "No 'pass' hashed password param supplied to login api";
            die(json_encode($result));
        }
        $stmt = $conn->prepare("SELECT password from user where email = ? LIMIT 1");

        $stmt->bind_param("s", $_GET["email"]);
        $stmt->bind_result($pass);

        $stmt->execute();
        if ($stmt->fetch()) {
            //if ($pass === $_GET["pass"]) {
            if (password_verify($_GET["pass"], $pass)) {
                $result->status = "success";
                $result->desc = "Successfully logged in!";
    
                $result->{"wasm-frontend-user-cookie"} = getRandomHex(12);
            } else {
                $result->status = "failed";
                $result->desc = "Password hashes didn't match";
            }
        }

        $stmt->close();
        break;
        case "register":

        break;
        case "project-create":

        break;
        default:
        $result->desc = "Unsupported request operation '" . $reqType . "', gracefully cancelling.";
        break;
    }
    $conn->close();
}

die(json_encode($result));
?>