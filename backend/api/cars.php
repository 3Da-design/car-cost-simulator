<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

require_once __DIR__ . '/../config/database.php';

try {
  $pdo = getPdo();
  $stmt = $pdo->query('SELECT id, name, fuel, engine, price, inspection FROM cars ORDER BY name');
  $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($cars);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
}
