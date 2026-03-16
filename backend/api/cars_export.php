<?php
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="cars.csv"');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  exit;
}

require_once __DIR__ . '/../config/database.php';

$out = fopen('php://output', 'w');
if ($out === false) {
  http_response_code(500);
  exit;
}

fprintf($out, "\xEF\xBB\xBF");

try {
  $pdo = getPdo();
  $stmt = $pdo->query('SELECT maker, model, fuel, engine, price, inspection FROM cars ORDER BY maker, model');
  $rows = $stmt->fetchAll(PDO::FETCH_NUM);

  fputcsv($out, ['maker', 'model', 'fuel', 'engine', 'price', 'inspection'], ',', '"', '');

  foreach ($rows as $row) {
    fputcsv($out, $row, ',', '"', '');
  }
} catch (PDOException $e) {
  fclose($out);
  http_response_code(500);
  exit;
}

fclose($out);
