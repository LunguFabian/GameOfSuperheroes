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

$new_hero_id = $data['heroId']??null;
if(!$new_hero_id){
    echo json_encode(["message"=>"Invalid heroId!"]);
}

$stmt=$conn->prepare("UPDATE users SET hero_id=? WHERE id=?");
$stmt->bind_param("ii", $new_hero_id, $user_id);
if($stmt->execute()){
    echo json_encode(["message"=>"hero_update_success"]);
}else{
    http_response_code(500);
    echo json_encode(["message"=>"hero_update_failed"]);
}

$stmt->close();
$conn->close();

