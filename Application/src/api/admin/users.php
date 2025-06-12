<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, DELETE");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

include_once('../../includes/db.php');
include_once('../jwtUtil/validateJWT.php');
include_once('../jwtUtil/decodeJWT.php');

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

if (!validateJWT($token)) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid or expired token!"]);
    exit();
}

$payload = decodeJWT($token);

if (empty($payload['is_admin']) || !$payload['is_admin']) {
    http_response_code(403);
    echo json_encode(["message" => "Admin access required"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $result = $conn->query("SELECT id, username, email, score, userRank, is_admin FROM users");
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "User id required"]);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();
    echo json_encode(["message" => "User deleted!"]);
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);