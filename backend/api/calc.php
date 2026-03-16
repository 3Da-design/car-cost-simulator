<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$distance = (int) ($input['distance'] ?? 0);
$fuel = (float) ($input['fuel'] ?? 0);
$gas_price = (int) ($input['gas_price'] ?? 0);
$insurance = (int) ($input['insurance'] ?? 0);
$parking = (int) ($input['parking'] ?? 0);
$engine_l = (float) ($input['engine'] ?? 0);
$inspection = (int) ($input['inspection'] ?? 0);

function getVehicleTax(int $engine_cc): int {
  if ($engine_cc <= 1000) return 25000;
  if ($engine_cc <= 1500) return 30500;
  if ($engine_cc <= 2000) return 36000;
  if ($engine_cc <= 2500) return 43500;
  if ($engine_cc <= 3000) return 50000;
  return 57000;
}

$engine_cc = (int) round($engine_l * 1000);
$gas_cost = $fuel > 0 ? (int) round($distance / $fuel * $gas_price) : 0;
$tax = getVehicleTax($engine_cc);
$inspection_annual = (int) ($inspection / 2);
$parking_annual = $parking * 12;

$total = $gas_cost + $tax + $inspection_annual + $insurance + $parking_annual;
$monthly = (int) round($total / 12);

echo json_encode([
  'gas_cost' => $gas_cost,
  'tax' => $tax,
  'inspection_annual' => $inspection_annual,
  'insurance' => $insurance,
  'parking_annual' => $parking_annual,
  'total' => $total,
  'monthly' => $monthly,
]);
