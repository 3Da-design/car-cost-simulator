-- 車維持費シミュレーター: cars テーブル
CREATE DATABASE IF NOT EXISTS car_cost_simulator;
USE car_cost_simulator;

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '車名（例: Raize, Corolla, Fit）',
  fuel DECIMAL(4,1) NOT NULL COMMENT '燃費 km/L',
  engine INT NOT NULL COMMENT '排気量 cc',
  price INT NOT NULL COMMENT '車両価格 円',
  inspection INT DEFAULT NULL COMMENT '車検費用目安（2年分）円'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- サンプルデータ: Toyota Raize, Corolla, Honda Fit など
INSERT INTO cars (name, fuel, engine, price, inspection) VALUES
('Toyota Raize', 20.7, 1000, 1700000, 100000),
('Toyota Corolla', 18.6, 1500, 2200000, 110000),
('Honda Fit', 23.2, 1300, 1900000, 100000),
('Toyota Yaris', 22.0, 1500, 1850000, 95000),
('Nissan Note', 21.0, 1200, 1950000, 105000);
