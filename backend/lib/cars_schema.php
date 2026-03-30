<?php
/**
 * 既存 DB に cars 拡張列が無い場合のみ ADD（複数 API から require 可）
 */
function ensure_cars_extended_columns(PDO $pdo): void {
  $has = $pdo->query("SHOW COLUMNS FROM cars LIKE 'segment'")->fetch(PDO::FETCH_ASSOC);
  if ($has) {
    return;
  }
  $pdo->exec(
    "ALTER TABLE cars ADD COLUMN segment ENUM('gasoline_hybrid','plugin_ev') NOT NULL DEFAULT 'gasoline_hybrid' COMMENT 'リスト区分' AFTER id"
  );
  $pdo->exec(
    "ALTER TABLE cars ADD COLUMN powertrain ENUM('bev','phev','fcv') NULL COMMENT 'plugin_ev のみ' AFTER segment"
  );
  $pdo->exec(
    "ALTER TABLE cars ADD COLUMN electric_wh_per_km DECIMAL(7,2) NULL COMMENT '電費 Wh/km（BEV・PHEV）' AFTER fuel"
  );
  $pdo->exec(
    "ALTER TABLE cars ADD COLUMN hydrogen_km_per_kg DECIMAL(6,2) NULL COMMENT '水素費 km/kg' AFTER electric_wh_per_km"
  );
  $pdo->exec("UPDATE cars SET segment = 'gasoline_hybrid'");
}

/**
 * electric_km_per_kwh 列を electric_wh_per_km（Wh/km）へ移行（値は km/kWh → Wh/km に換算）
 */
function migrate_electric_km_per_kwh_to_wh_per_km(PDO $pdo): void {
  $hasNew = $pdo->query("SHOW COLUMNS FROM cars LIKE 'electric_wh_per_km'")->fetch(PDO::FETCH_ASSOC);
  if ($hasNew) {
    return;
  }
  $hasOld = $pdo->query("SHOW COLUMNS FROM cars LIKE 'electric_km_per_kwh'")->fetch(PDO::FETCH_ASSOC);
  if (!$hasOld) {
    return;
  }
  $pdo->exec(
    "ALTER TABLE cars CHANGE COLUMN electric_km_per_kwh electric_wh_per_km DECIMAL(7,2) NULL COMMENT '電費 Wh/km（BEV・PHEV）'"
  );
  $pdo->exec(
    'UPDATE cars SET electric_wh_per_km = ROUND(1000 / electric_wh_per_km, 2) ' .
    'WHERE electric_wh_per_km IS NOT NULL AND electric_wh_per_km > 0 AND electric_wh_per_km <= 45'
  );
}
