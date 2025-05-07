<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers:Authorization");

include_once("../../includes/db.php");
include_once("../jwtUtil/decodeJWT.php");
include_once("../jwtUtil/validateJWT.php");

if($_SERVER["REQUEST_METHOD"] != "GET"){
    http_response_code(405);
    echo json_encode(["message"=>"Method not allowed."]);
    exit();
}

$headers=getallheaders();
if(!isset($headers['Authorization'])){
    http_response_code(401);
    echo json_encode(["message"=>"Unauthorized Access!"]);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

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

$stmt = $conn->prepare("SELECT username,email FROM `users` WHERE `id`=?");
$stmt->bind_param("i",$user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if(!$user){
    http_response_code(404);
    echo json_encode(["message"=>"User not found!"]);
    exit();
}

echo json_encode($user);

$stmt->close();
$conn->close();