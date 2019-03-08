<?php
//error_reporting(0);

function getRandomHex($num_bytes=4) {
    return bin2hex(openssl_random_pseudo_bytes($num_bytes));
}

header("Content-Type: application/json");

$dbConfig = json_decode(file_get_contents("dbconfig.json"));

$result = new \stdClass();

$reqType = $_GET["type"];
$result->dbc = $dbConfig;
$conn = new mysqli($dbConfig->name, $dbConfig->user, $dbConfig->pass, $dbConfig->dtbs);

if ($conn->connect_error) {
    $result->status = "failed";
    $result->connect_error = $conn->connect_error;
} else {
    switch ($reqType) {
        case "login":
        $stmt = $conn->prepare("SELECT password from user where email = dev@jonathancrowder.com LIMIT 1");
        $stmt->bind_param("s", $_GET["email"]);

        $stmt->fetch();

        if ($pass === $_GET["pass"]) {
            $result->status = "success";
            $result->desc = "Successfully logged in!";

            $result->{"wasm-frontend-user-cookie"} = getRandomHex(12);
        } else {
            $result->status = "failed";
            $result->desc = "Password hashes didn't match";
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