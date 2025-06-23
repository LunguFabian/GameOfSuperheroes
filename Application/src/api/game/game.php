<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers:Authorization");

include_once('../../includes/db.php');
include_once('../jwtUtil/validateJWT.php');
include_once('../jwtUtil/decodeJWT.php');

if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "method_not_allowed"]);
    exit();
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["message" => "unauthorized_access"]);
    exit();
}

$token = str_replace("Bearer ", "", $headers['Authorization']);

if (!validateJWT($token)) {
    http_response_code(401);
    echo json_encode(["message" => "invalid_token"]);
    exit();
}

$payload = decodeJWT($token);
$user_id = $payload['id'] ?? null;
$game_id = $_GET['id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["message" => "invalid_token_payload"]);
    exit();
}

if (!$game_id) {
    http_response_code(400);
    echo json_encode(["message" => "missing_game_id"]);
    exit();
}

$stmt = $conn->prepare("SELECT g.id,g.difficulty,g.hero_id,g.score,gi.scenario_id,gi.question1_id,gi.question2_id,gi.question3_id
                            FROM games g
                            JOIN game_info gi ON g.id = gi.game_id
                            WHERE g.id = ? AND g.user_id = ?");
$stmt->bind_param("ii", $game_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$game = $result->fetch_assoc();
$stmt->close();

if (!$game) {
    http_response_code(404);
    echo json_encode(["message" => "game_not_found!"]);
    exit();
}

if ($game['score'] != -1) {
    http_response_code(403);
    echo json_encode(["message" => "game_started"]);
    exit();
}

$stmt = $conn->prepare("SELECT image_url
                            FROM heroes
                            WHERE id = ? ");
$stmt->bind_param("i", $game['hero_id']);
$stmt->execute();
$result = $stmt->get_result();
$hero = $result->fetch_assoc();
$hero_img= $hero['image_url'] ?? "";
$stmt->close();

$stmt = $conn->prepare("SELECT v.name,v.image_url
                            FROM villains v JOIN nemesis n 
                            ON v.id = n.villain_id
                            WHERE n.hero_id = ? 
                            ORDER BY RAND()
                            LIMIT 1");
$stmt->bind_param("i", $game['hero_id']);
$stmt->execute();
$villain_result = $stmt->get_result();
$villain = $villain_result->fetch_assoc();
$villain_name = $villain['name'] ?? "the enemy";
$villain_img = $villain['image_url'] ?? "";
$stmt->close();

$stmt = $conn->prepare("SELECT part1,part2,part3,part4
                            FROM scenarios
                            WHERE id=?");
$stmt->bind_param("i", $game['scenario_id']);
$stmt->execute();
$scenario_result = $stmt->get_result();
$scenario = $scenario_result->fetch_assoc();
$stmt->close();



$scenario_parts = [
    "part1" => str_replace("[ENEMY_NAME]", $villain_name, $scenario['part1']),
    "part2" => str_replace("[ENEMY_NAME]", $villain_name, $scenario['part2']),
    "part3" => str_replace("[ENEMY_NAME]", $villain_name, $scenario['part3']),
    "part4" => str_replace("[ENEMY_NAME]", $villain_name, $scenario['part4'])
];

$questions = [];
$question_ids = [$game['question1_id'], $game['question2_id'], $game['question3_id']];
$stmt = $conn->prepare("SELECT id, question_text, option1, option2, option3, option4 FROM questions WHERE id IN (?, ?, ?)");
$stmt->bind_param("iii", $question_ids[0], $question_ids[1], $question_ids[2]);
$stmt->execute();
$question_result = $stmt->get_result();
$stmt->close();

while ($row = $question_result->fetch_assoc()) {
    $question=[
        "id" => $row["id"],
        "text" => $row["question_text"],
        "difficulty" => $game['difficulty'],
    ];
    if($game['difficulty']=="easy"){
        $question['options']=[
            $row['option1'],
            $row['option2'],
        ];
    }else if($game['difficulty']=="medium"){
        $question['options']=[
            $row['option1'],
            $row['option2'],
            $row['option3'],
            $row['option4'],
        ];
    } else if($game['difficulty']=="hard"){
        $question['options']=null;
    }
    $questions[]=$question;
}

echo json_encode([
    "scenario"=>$scenario_parts,
    "questions"=>$questions,
    "difficulty"=>$game['difficulty'],
    "game_id"=>$game['id'],
    "villain_image"=>$villain_img,
    "hero_image"=>$hero_img,
]);

$conn->close();




