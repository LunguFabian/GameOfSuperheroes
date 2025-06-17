<?php
global $conn;
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
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
    $result = $conn->query("SELECT * FROM scenarios");
    $scenarios = [];
    while ($row = $result->fetch_assoc()) {
        $scenarios[] = $row;
    }
    echo json_encode($scenarios);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['part1'], $data['part2'], $data['part3'], $data['part4'],$data['language'])) {
        http_response_code(400);
        echo json_encode(["message" => "All scenario parts required"]);
        exit();
    }
    $stmt = $conn->prepare("INSERT INTO scenarios (part1, part2, part3, part4,language) VALUES (?, ?, ?, ?,?)");
    $stmt->bind_param("sssss", $data['part1'], $data['part2'], $data['part3'], $data['part4'],$data['language']);
    $stmt->execute();
    echo json_encode(["message" => "Scenario added!", "id" => $stmt->insert_id]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Scenario id required"]);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM scenarios WHERE id=?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();
    echo json_encode(["message" => "Scenario deleted!"]);
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);