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

$game_id = $data['game_id']??null;
$question_id = $data['question_id']??null;
$answer = $data['answer']??null;

$stmt = $conn->prepare("SELECT score FROM games WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $game_id, $user_id);
$stmt->execute();
$game_result = $stmt->get_result();
$game = $game_result->fetch_assoc();
$stmt->close();

if (!$game) {
    http_response_code(404);
    echo json_encode(["message" => "game_not_found"]);
    exit();
}

$stmt = $conn->prepare("SELECT question_text,option1,option2,option3,option4,correct_option,score FROM questions WHERE id = ?");
$stmt->bind_param("i",$question_id);
$stmt->execute();
$question_result = $stmt->get_result();
$question = $question_result->fetch_assoc();
$stmt->close();

if(!$question)
{
    http_response_code(404);
    echo json_encode(["message"=>"question_not_found"]);
    exit();
}

$correct_option_index=$question['correct_option']??null;
$correct_answer=$question["option{$correct_option_index}"]??null;
$is_correct= strtolower(trim($answer)) === strtolower(trim($correct_answer));

$new_score=$game['score'];
if($new_score==-1){
    $new_score=0;
}
if($is_correct){
    $question_score=$question['score'];
    $new_score=$new_score+$question_score;

    $stmt = $conn->prepare("UPDATE games SET score = ? WHERE id = ?");
    $stmt->bind_param("ii", $new_score, $game_id);
    $stmt->execute();
    $stmt->close();
}

echo json_encode([
    "is_correct"=>$is_correct,
    "score"=>$new_score
]);

$conn->close();

