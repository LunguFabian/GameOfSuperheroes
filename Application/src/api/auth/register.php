<?php
global $conn;
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once('../../includes/db.php');

if($_SERVER["REQUEST_METHOD"] != "POST"){
    http_response_code(405);
    echo json_encode(["message"=>"method_not_allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(["message" => "missing_fields"]);
    exit();
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = trim($data['password']);

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["message" => "all_fields_required"]);
    exit();
}

$username_check = $conn->prepare("SELECT id FROM users WHERE username = ?");
$username_check->bind_param("s", $username);
$username_check->execute();
$username_check->store_result();

if ($username_check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["message" => "user_exist"]);
    exit();
}

$email_check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$email_check->bind_param("s", $email);
$email_check->execute();
$email_check->store_result();

if ($email_check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["message" => "email_exist"]);
    exit();
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$insert = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$insert->bind_param("sss", $username, $email, $hashedPassword);

if ($insert->execute()) {
    http_response_code(201);
    echo json_encode(["message" => "register_succes"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "register_fail"]);
}

$username_check->close();
$email_check->close();
$insert->close();
$conn->close();


