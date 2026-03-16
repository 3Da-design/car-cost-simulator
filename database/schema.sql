CREATE DATABASE IF NOT EXISTS car_cost_simulator;
USE car_cost_simulator;

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  maker VARCHAR(50) NOT NULL COMMENT 'メーカー名（例: Toyota, Honda）',
  model VARCHAR(100) NOT NULL COMMENT '車種名・グレード（例: Aqua X, N-BOX Base）',
  fuel DECIMAL(4,1) NOT NULL COMMENT '燃費 km/L',
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
