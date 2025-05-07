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

$newEmail = trim($payload['newEmail'] ?? '');
$password = trim($payload['password'] ?? '');

if(empty($newEmail) || empty($password)){
    http_response_code(400);
    echo json_encode(["message"=>"Both new email and password are required"]);
    exit();
}

