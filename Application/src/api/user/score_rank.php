<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Authorization");

include_once('../../includes/db.php');
include_once('../jwtUtil/validateJWT.php');
include_once('../jwtUtil/decodeJWT.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit();
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["message" => "Missing Authorization header."]);
    exit();
}

$token = str_replace("Bearer ", "", $headers['Authorization']);
if (!validateJWT($token)) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid or expired token."]);
    exit();
}

$payload = decodeJWT($token);
$user_id = $payload['id'] ?? null;
$game_id = $_GET['id'] ?? null;

if (!$user_id || !$game_id) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user ID or game ID."]);
    exit();
}

$stmt = $conn->prepare("SELECT score FROM games WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $game_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$game = $result->fetch_assoc();
$stmt->close();

if (!$game) {
    http_response_code(404);
    echo json_encode(["message" => "Game not found or not authorized."]);
    exit();
}

$game_score = (int)$game['score'];

if ($game_score <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Game has no valid score."]);
    exit();
}

$stmt = $conn->prepare("UPDATE users SET score = score + ? WHERE id = ?");
$stmt->bind_param("ii", $game_score, $user_id);
$update_success = $stmt->execute();
$stmt->close();

if (!$update_success) {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update user score."]);
    exit();
}

$stmt = $conn->prepare("SELECT score FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$new_score = (int)$user['score'];
$stmt->close();

$rank = "Rookie";
if ($new_score > 5000) {
    $rank = "Mythic";
} elseif ($new_score > 2500) {
    $rank = "Legendary";
} elseif ($new_score > 1000) {
    $rank = "Superhero";
} elseif ($new_score > 500) {
    $rank = "Vigilante";
} elseif ($new_score > 250) {
    $rank = "Hero in Training";
} elseif ($new_score > 100) {
    $rank = "Sidekick";
}


$stmt = $conn->prepare("UPDATE users SET userRank = ? WHERE id = ?");
$stmt->bind_param("si", $rank, $user_id);
$stmt->execute();
$stmt->close();

echo json_encode([
    "message" => "Score updated successfully.",
    "added_score" => $game_score,
    "new_total_score" => $new_score,
    "new_rank" => $rank
]);

$conn->close();
