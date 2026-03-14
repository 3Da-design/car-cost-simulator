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
