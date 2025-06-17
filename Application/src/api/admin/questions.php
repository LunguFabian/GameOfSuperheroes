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
    $result = $conn->query("SELECT * FROM questions");
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    echo json_encode($questions);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $difficulty = $data['difficulty'] ?? null;

    if (!$difficulty || !in_array($difficulty, ['easy', 'medium', 'hard'])) {
        http_response_code(400);
        echo json_encode(["message" => "Difficulty must be easy, medium, or hard"]);
        exit();
    }
    if (empty($data['question_text'])) {
        http_response_code(400);
        echo json_encode(["message" => "Question text is required"]);
        exit();
    }

    if ($difficulty === 'hard') {
        if (empty($data['option1'])) {
            http_response_code(400);
            echo json_encode(["message" => "Option1 (answer) is required for hard questions"]);
            exit();
        }
        $option1 = $data['option1'];
        $option2 = $option3 = $option4 = null;
        $correct_option = 1;
    } else if ($difficulty === 'easy') {
        if (empty($data['option1']) || empty($data['option2']) || empty($data['correct_option'])) {
            http_response_code(400);
            echo json_encode(["message" => "Option1, Option2, and correct_option are required for easy questions"]);
            exit();
        }
        $option1 = $data['option1'];
        $option2 = $data['option2'];
        $option3 = $data['option3'] ?? null;
        $option4 = $data['option4'] ?? null;
        $correct_option = intval($data['correct_option']);
    } else { // medium
        if (empty($data['option1']) || empty($data['option2']) || empty($data['option3']) || empty($data['option4']) || empty($data['correct_option'])) {
            http_response_code(400);
            echo json_encode(["message" => "All 4 options and correct_option are required for medium questions"]);
            exit();
        }
        $option1 = $data['option1'];
        $option2 = $data['option2'];
        $option3 = $data['option3'];
        $option4 = $data['option4'];
        $correct_option = intval($data['correct_option']);
    }

    $score = $data['score'] ?? 10;
    $language=$data['language'] ?? 'ro';
    $stmt = $conn->prepare("INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score,language) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)");
    $stmt->bind_param("sssssssis", $data['question_text'], $option1, $option2, $option3, $option4, $correct_option, $difficulty,$score, $language);
    $stmt->execute();
    echo json_encode(["message" => "Question added!", "id" => $stmt->insert_id]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Question id required"]);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM questions WHERE id=?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();
    echo json_encode(["message" => "Question deleted!"]);
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);