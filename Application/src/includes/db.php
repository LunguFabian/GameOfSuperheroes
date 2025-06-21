<?php
$host = 'db';
$port = 3306;
$db   = 'heroes_db';
$user = 'user';
$pass = 'pass';

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");