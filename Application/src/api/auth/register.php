<?php
global $conn;
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once('../../includes/db.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = trim($data['password']);

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["message" => "All fields are required."]);
    exit();
}

$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["message" => "Username or email already exists."]);
    exit();
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$insert = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$insert->bind_param("sss", $username, $email, $hashedPassword);

if ($insert->execute()) {
    http_response_code(201); // Created
    echo json_encode(["message" => "User registered successfully."]);
} else {
    http_response_code(500); // Server error
    echo json_encode(["message" => "Failed to register user."]);
}

$stmt->close();
$insert->close();
$conn->close();


