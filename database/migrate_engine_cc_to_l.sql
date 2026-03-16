-- 排気量を cc から L に変更するマイグレーション
-- 既存の cars テーブルに cc でデータが入っている場合に実行してください。

-- 1. カラム型を INT から DECIMAL(4,2) に変更
ALTER TABLE cars MODIFY engine DECIMAL(4,2) NOT NULL COMMENT '排気量 L';

-- 2. 既存の cc 値を L に変換（1000で割る）
UPDATE cars SET engine = engine / 1000;
