<?php
error_reporting(0);

function getRandomHex($num_bytes=4) {
    return bin2hex(openssl_random_pseudo_bytes($num_bytes));
}

function isSecure() {
    return
      (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
      || $_SERVER['SERVER_PORT'] == 443;
}

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$dbConfig = json_decode(file_get_contents("dbconfig.json"));

$result = new \stdClass();

// if (!isSecure()) {
//     $result->status = "failed";
//     $result->desc = "Connection is not secure!";
//     die(json_encode($result));
// }

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
        $stmt = $conn->prepare("SELECT * from user where email = ? LIMIT 1");

        $stmt->bind_param("s", $_GET["email"]);

        $stmt->execute();
        $data = $stmt->get_result();
        if ($data = $data->fetch_assoc()) {

            if (password_verify($_GET["pass"], $data["password"])) {
                $result->status = "success";
                $result->desc = "Successfully logged in!";
    
                $result->{"wasm-frontend-user-cookie"} = $data["active_cookie"];//getRandomHex(12);
            } else {
                $result->status = "failed";
                $result->desc = "Credentials incorrect"; //Don't incentivise brute forcing by telling them pw is wrong..
            }
        } else {
            $result->status = "failed";
            $result->desc = "Credentials incorrect";
        }
        $stmt->close();
        break;
        case "details":
        $stmt = $conn->prepare("SELECT display, email, id from user where active_cookie = ? LIMIT 1");

        $stmt->bind_param("s", $_GET["wasm-frontend-user-cookie"]);

        $stmt->execute();
        $data = $stmt->get_result();
        if ($data = $data->fetch_assoc())
        {
            $result->status = "success";
            $result->details = $data;
        } else {
            $result->status = "failed";
            $result->desc = "Couldn't retrieve data for cookie, problem with cookie?";
        }

        $stmt->close();
        break;
        case "publicdetails":
        $stmt = $conn->prepare("SELECT display, email from user where id = ? LIMIT 1");
        $stmt->bind_param("s", $_GET["id"]);
        $stmt->execute();
        $data = $stmt->get_result();
        if ($data = $data->fetch_assoc()) {
            $result->status = "success";
            $result->publicdetails = $data;
        } else {
            $result->status = "failed";
            $result->desc = "Couldn't retrieve publicdetails of nonexistent user id";
        }
        $stmt->close();
        break;
        case "register":
        if (!isset($_GET["pass"])) {
            $result->status = "failed";
            $result->desc = "No 'pass' param supplied, aborting.";
            die(json_encode($result));
        }
        if (!isset($_GET["email"])) {
            $result->status = "failed";
            $result->desc = "No 'email' param supplied, aborting.";
            die(json_encode($result));
        }
        if (!isset($_GET["display"])) {
            $result->status = "failed";
            $result->desc = "No 'display' param supplied, aborting.";
            die(json_encode($result));
        }
        $stmt = $conn->prepare("SELECT display from user WHERE email = ?");
        $stmt->bind_param("s", $_GET["email"]);
        $stmt->execute();
        $data = $stmt->get_result();
        if ($data = $data->fetch_assoc()) {
            $result->status = "failed";
            $result->desc = "A user with that email is registered already?";
        } else {
            $stmt0 = $conn->prepare("INSERT INTO user (id, display, active_cookie, password, email) VALUES (NULL, ?, ?, ?, ?);");
            $cookie = getRandomHex(12);
            $hashpass = password_hash($_GET["pass"], PASSWORD_BCRYPT);
            $stmt0->bind_param("ssss", $_GET["display"], $cookie, $hashpass, $_GET["email"]);
            $stmt0->execute();
            $data0 = $conn->affected_rows;
            if ($data0 > 0) {
                $result->status = "success";
                $result->desc = "Added " . $_GET["display"] . " to the registered users";
            } else {
                $result->status = "failed";
                $result->desc = "Nothing changed? This shouldn't happen, please notify author!";
            }
            $stmt0->close();
        }
        $stmt->close();
        break;
        case "projects-list": 
        $stmt = $conn->prepare("SELECT name, id, fetchurl, description from project where owner = ? LIMIT 10");
        $stmt->bind_param("s", $_GET["owner"]);
        $stmt->execute();
        $data = $stmt->get_result();
        
        $result->projects = array();
        while ($data0 = $data->fetch_assoc()) {
            array_push($result->projects, $data0);
        }
        $result->status = "success";
        $stmt->close();
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