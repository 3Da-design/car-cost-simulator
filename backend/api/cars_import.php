<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
ob_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  ob_end_clean();
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  ob_end_clean();
  echo json_encode(['error' => 'CSVファイルを選択してください']);
  exit;
}

$tmpPath = $_FILES['csv']['tmp_name'];
$handle = fopen($tmpPath, 'r');
if ($handle === false) {
  http_response_code(400);
  ob_end_clean();
  echo json_encode(['error' => 'ファイルを開けませんでした']);
  exit;
}

// Read first row (header) and handle BOM (PHP 8.4+ requires explicit escape for fgetcsv)
$firstRow = fgetcsv($handle, 0, ',', '"', '');
if ($firstRow === false) {
  fclose($handle);
  http_response_code(400);
  ob_end_clean();
  echo json_encode(['error' => 'CSVが空です']);
  exit;
}
$header = array_map('trim', $firstRow);
if (isset($header[0]) && substr($header[0], 0, 3) === "\xEF\xBB\xBF") {
  $header[0] = ltrim($header[0], "\xEF\xBB\xBF");
}
$expected = ['maker', 'model', 'fuel', 'engine', 'price', 'inspection'];
$headerLower = array_map('strtolower', $header);
foreach ($expected as $col) {
  if (!in_array($col, $headerLower, true)) {
    fclose($handle);
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['error' => 'CSVの1行目は maker,model,fuel,engine,price,inspection である必要があります']);
    exit;
  }
}
$makerIdx = array_search('maker', $headerLower, true);
$modelIdx = array_search('model', $headerLower, true);
$fuelIdx = array_search('fuel', $headerLower, true);
$engineIdx = array_search('engine', $headerLower, true);
$priceIdx = array_search('price', $headerLower, true);
$inspectionIdx = array_search('inspection', $headerLower, true);

require_once __DIR__ . '/../config/database.php';

try {
  $pdo = getPdo();
  $pdo->beginTransaction();
  $stmt = $pdo->prepare('INSERT INTO cars (maker, model, fuel, engine, price, inspection) VALUES (?, ?, ?, ?, ?, ?)');
  $imported = 0;
  $lineNum = 1;

  $maxIdx = max($makerIdx, $modelIdx, $fuelIdx, $engineIdx, $priceIdx, $inspectionIdx);
  while (($row = fgetcsv($handle, 0, ',', '"', '')) !== false) {
    $lineNum++;
    if (count($row) <= $maxIdx) {
      if (trim(implode('', $row)) === '') {
        continue;
      }
      $pdo->rollBack();
      fclose($handle);
      http_response_code(400);
      ob_end_clean();
      echo json_encode(['error' => "{$lineNum}行目: 列数が不足しています"]);
      exit;
    }
    $maker = trim($row[$makerIdx] ?? '');
    $model = trim($row[$modelIdx] ?? '');
    if ($maker === '' && $model === '' && trim(implode('', $row)) === '') {
      continue;
    }
    $fuelRaw = trim($row[$fuelIdx] ?? '');
    $engineRaw = trim($row[$engineIdx] ?? '');
    $priceRaw = trim($row[$priceIdx] ?? '');
    $inspectionRaw = isset($row[$inspectionIdx]) ? trim($row[$inspectionIdx]) : '';

    if ($maker === '') {
      $pdo->rollBack();
      fclose($handle);
      ob_end_clean();
      echo json_encode(['error' => "{$lineNum}行目: メーカー名が空です"]);
      exit;
    }
    if ($model === '') {
      $pdo->rollBack();
      fclose($handle);
      ob_end_clean();
      echo json_encode(['error' => "{$lineNum}行目: 車種名が空です"]);
      exit;
    }
    if ($fuelRaw === '' || !is_numeric($fuelRaw) || (float)$fuelRaw < 0) {
      $pdo->rollBack();
      fclose($handle);
      ob_end_clean();
      echo json_encode(['error' => "{$lineNum}行目: 燃費は0以上の数で入力してください"]);
      exit;
    }
    if ($engineRaw === '' || !is_numeric($engineRaw) || (int)$engineRaw < 0) {
      $pdo->rollBack();
      fclose($handle);
      ob_end_clean();
      echo json_encode(['error' => "{$lineNum}行目: 排気量は0以上の整数で入力してください"]);
      exit;
    }
    if ($priceRaw === '' || !is_numeric($priceRaw) || (int)$priceRaw < 0) {
      $pdo->rollBack();
      fclose($handle);
      ob_end_clean();
      echo json_encode(['error' => "{$lineNum}行目: 車両価格は0以上の数で入力してください"]);
      exit;
    }

    $fuel = (float)$fuelRaw;
    $engine = (int)$engineRaw;
    $price = (int)$priceRaw;
    $inspection = $inspectionRaw === '' ? null : (int)$inspectionRaw;
    if ($inspection !== null && $inspection < 0) {
      $inspection = null;
    }

    $stmt->execute([$maker, $model, $fuel, $engine, $price, $inspection]);
    $imported++;
  }

  $pdo->commit();
  fclose($handle);
  ob_end_clean();
  echo json_encode(['success' => true, 'imported' => $imported]);
} catch (PDOException $e) {
  if (isset($pdo) && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  if (isset($handle) && is_resource($handle)) {
    fclose($handle);
  }
  http_response_code(500);
  ob_end_clean();
  echo json_encode(['error' => 'データベースエラー', 'detail' => $e->getMessage()]);
}
