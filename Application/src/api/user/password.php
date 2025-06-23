<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers:Authorization");

include_once('../../includes/db.php');
include_once('../jwtUtil/validateJWT.php');
include_once('../jwtUtil/decodeJWT.php');

if($_SERVER["REQUEST_METHOD"] != "PUT"){
    http_response_code(405);
    echo json_encode(["message"=>"method_not_allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$headers=getallheaders();
if(!isset($headers['Authorization'])){
    http_response_code(401);
    echo json_encode(["message"=>"unauthorized_access"]);
    exit();
}

$token=str_replace('Bearer ', '', $headers['Authorization']);

if(!validateJWT($token)){
    http_response_code(401);
    echo json_encode(["message"=>"invalid_token"]);
    exit();
}

$payload=decodeJWT($token);
$user_id = $payload['id']??null;

if(!$user_id){
    http_response_code(400);
    echo json_encode(["message"=>"invalid_token_payload"]);
    exit();
}

$newPassword = trim($data['newPassword'] ?? '');
$oldPassword = trim($data['oldPassword'] ?? '');

if (empty($newPassword) || empty($oldPassword)) {
    http_response_code(400);
    echo json_encode(["message" => "Both new and old password are required"]);
    exit();
}

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if(!$user){
    http_response_code(400);
    echo json_encode(["message"=>"user_not_found"]);
    exit();
}

if (!password_verify($oldPassword, $user['password'])) {
    http_response_code(403);
    echo json_encode(["message" => "incorrect_password"]);
    exit();
}

$hashedNewPassword = password_hash($newPassword, PASSWORD_BCRYPT);

$updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$updateStmt->bind_param("si", $hashedNewPassword, $user_id);
if ($updateStmt->execute()) {
    echo json_encode(["message" => "password_updated"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "password_update_failed"]);
}

$stmt->close();
$updateStmt->close();
$conn->close();