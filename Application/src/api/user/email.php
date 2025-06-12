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
    echo json_encode(["message"=>"Method not allowed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$headers=getallheaders();
if(!isset($headers['Authorization'])){
    http_response_code(401);
    echo json_encode(["message"=>"Unauthorized Access!"]);
    exit();
}

$token=str_replace('Bearer ', '', $headers['Authorization']);

if(!validateJWT($token)){
    http_response_code(401);
    echo json_encode(["message"=>"Invalid or expired token!"]);
    exit();
}

$payload=decodeJWT($token);
$user_id = $payload['id']??null;

if(!$user_id){
    http_response_code(400);
    echo json_encode(["message"=>"Invalid token payload"]);
    exit();
}

$newEmail = trim($data['newEmail'] ?? '');
$password = trim($data['password'] ?? '');

if(empty($newEmail) || empty($password)){
    http_response_code(400);
    echo json_encode(["message"=>"Both new email and password are required"]);
    exit();
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $newEmail);
$stmt->execute();
$stmt->store_result();
if($stmt->num_rows > 0){
    http_response_code(409);
    echo json_encode(["message"=>"Email already taken"]);
    $stmt->close();
    exit();
}
$stmt->close();

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if(!$user){
    http_response_code(404);
    echo json_encode(["message"=>"User not found"]);
    exit();
}

if(!password_verify($password, $user['password'])){
    http_response_code(403);
    echo json_encode(["message"=>"Incorrect password"]);
    exit();
}

$stmt = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
$stmt->bind_param("si", $newEmail, $user_id);
if($stmt->execute()){
    echo json_encode(["message"=>"Email updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message"=>"Failed to update email"]);
}
$stmt->close();
$conn->close();

