<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers:Authorization");

include_once('../../includes/db.php');
include_once('../jwtUtil/validateJWT.php');
include_once('../jwtUtil/decodeJWT.php');

if($_SERVER['REQUEST_METHOD'] !='POST'){
    http_response_code(405);
    echo json_encode(["message"=>"method_not_allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"),true);

$headers=getallheaders();
if(!isset($headers['Authorization'])){
    http_response_code(401);
    echo json_encode(["message"=>"unauthorized_access"]);
    exit();
}

$token =str_replace("Bearer ","",$headers['Authorization']);

if(!validateJWT($token)){
    http_response_code(401);
    echo json_encode(["message"=>"invalid_token"]);
    exit();
}

$payload=decodeJWT($token);
$user_id = $payload['id']??null;

if(!$user_id){
    http_response_code(401);
    echo json_encode(["message"=>"invalid_token_payload"]);
    exit();
}

$stmt = $conn->prepare("SELECT hero_id FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if(!$user){
    http_response_code(404);
    echo json_encode(["message"=>"user_not_found"]);
    exit();
}

if ($user['hero_id'] === null) {
    http_response_code(400);
    echo json_encode(["message" => "hero_not_selected"]);
    exit();
}

$difficulty = $data['difficulty']??null;
$language = $data['language']??'ro';

if(!in_array($difficulty, ['easy', 'medium', 'hard'])){
    http_response_code(400);
    echo json_encode(["message"=>"Invalid difficulty"]);
    exit();
}

$stmt = $conn->prepare("INSERT INTO games (user_id,hero_id, difficulty,language) VALUES (?, ?, ?,?)");
$stmt->bind_param("iiss", $user_id,$user['hero_id'], $difficulty,$language);
$stmt->execute();
$game_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
    "game_id" => $game_id,
    "message" => "Game created successfully"
]);

$conn->close();




