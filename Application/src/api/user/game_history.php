<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers:Authorization");

include_once("../../includes/db.php");
include_once("../jwtUtil/decodeJWT.php");
include_once("../jwtUtil/validateJWT.php");

if ($_SERVER["REQUEST_METHOD"] != "GET") {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit();
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized Access!"]);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

if (!validateJWT($token)) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid or expired token!"]);
    exit();
}

$payload = decodeJWT($token);
$user_id = $payload['id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid token payload"]);
    exit();
}

$games_history = [];
$stmt = $conn->prepare("SELECT h.name as hero_name,g.difficulty,g.score 
                               FROM games g JOIN heroes h ON g.hero_id=h.id 
                               WHERE g.user_id=? and g.score>-1;");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["message" => "No games played yet!"]);
    exit();
}
while ($row = $result->fetch_assoc()) {
    $games_history[] = $row;
}
echo json_encode($games_history);

$stmt->close();
$conn->close();