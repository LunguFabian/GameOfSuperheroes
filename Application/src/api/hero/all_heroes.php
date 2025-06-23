<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers:Authorization");

include_once('../../includes/db.php');
include_once('../jwtUtil/validateJWT.php');
include_once('../jwtUtil/decodeJWT.php');

if($_SERVER["REQUEST_METHOD"] != "GET"){
    http_response_code(405);
    echo json_encode(["message"=>"method_not_allowed"]);
    exit();
}

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

$heroes=[];
$stmt = $conn->prepare("SELECT id,name,image_url FROM heroes");
$stmt->execute();
$result = $stmt->get_result();
while($row = $result->fetch_assoc()){
    $heroes[]=$row;
}
echo json_encode(["heroes"=>$heroes]);

$stmt->close();
$conn->close();