CREATE DATABASE IF NOT EXISTS car_cost_simulator;
USE car_cost_simulator;

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  segment ENUM('gasoline_hybrid','plugin_ev') NOT NULL DEFAULT 'gasoline_hybrid' COMMENT 'リスト区分',
  powertrain ENUM('bev','phev','fcv') NULL COMMENT 'plugin_ev のみ',
  maker VARCHAR(50) NOT NULL COMMENT 'メーカー名（例: Toyota, Honda）',
  model VARCHAR(100) NOT NULL COMMENT '車種名・グレード（例: Aqua X, N-BOX Base）',
  fuel DECIMAL(4,1) NOT NULL COMMENT 'GHV: km/L / PHEV: ガソリン時 km/L / BEV・FCVは0可',
  electric_wh_per_km DECIMAL(7,2) NULL COMMENT '電費 Wh/km（BEV・PHEV・カタログ表記に合わせる）',
  hydrogen_km_per_kg DECIMAL(6,2) NULL COMMENT '水素費 km/kg（FCV）',
  engine DECIMAL(5,3) NOT NULL COMMENT '排気量 L（小数点以下3桁）',
  price INT NOT NULL COMMENT '車両価格 円',
  inspection INT DEFAULT NULL COMMENT '車検費用目安（2年分）円'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 既存DB用マイグレーション（cc または DECIMAL(4,2) から移行する場合のみ実行）
-- ============================================================
-- 1. 排気量を cc から L に変更する場合（engine が INT のとき）:
--    ALTER TABLE cars MODIFY engine DECIMAL(5,3) NOT NULL COMMENT '排気量 L（小数点以下3桁）';
--    UPDATE cars SET engine = engine / 1000;
--
-- 2. 排気量を小数点以下3桁にする場合（engine が DECIMAL(4,2) のとき）:
--    ALTER TABLE cars MODIFY engine DECIMAL(5,3) NOT NULL COMMENT '排気量 L（小数点以下3桁）';
--
-- 3. segment / powertrain / electric / hydrogen 列追加（backend/lib/cars_schema.php の ensure_cars_extended_columns と同等）:
--    または php 経由のインポート・cars API 初回アクセスで自動適用されます。
--
-- 4. electric_km_per_kwh を electric_wh_per_km（Wh/km）へ変更する場合:
--    backend の migrate_electric_km_per_kwh_to_wh_per_km() が cars API 等で自動実行されます。
