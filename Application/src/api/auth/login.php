<?php
global $conn;
header('Content-Type: application/json;charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

include_once("../../includes/db.php");
include_once("../jwtUtil/createJWT.php");

if($_SERVER["REQUEST_METHOD"] != "POST"){
    http_response_code(405);
    echo json_encode(["message"=>"method_not_allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"),true);

if (!isset($data['username'],$data['password'])) {
    http_response_code(400);
    echo json_encode(["message" => "missing_fields"]);
    exit();
}

$username=trim($data['username']);
$password=trim($data['password']);

if (empty($username)|| empty($password)) {
    http_response_code(400);
    echo json_encode(["message" => "all_fields_required"]);
    exit();
}

$stmt=$conn->prepare("SELECT id,is_admin,password FROM users WHERE username=?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["message" => "invalid_username"]);
    exit();
}

$user=$result->fetch_assoc();

if(!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["message" => "invalid_password"]);
    exit();
}

$payload=[
    "id"=>$user['id'],
    "is_admin"=>$user['is_admin'],
    "exp"=>time()+3600
];

$jwt=generateJWT($payload);

http_response_code(200);
echo json_encode(["token"=>$jwt]);

$stmt->close();
$conn->close();