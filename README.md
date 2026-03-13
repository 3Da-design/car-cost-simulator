# 車の維持費シミュレーター

車の年間・月間維持費を計算する Web アプリです。

## 構成

- **フロントエンド**: React (Vite) + Chart.js
- **バックエンド**: PHP API
- **データベース**: MySQL

## セットアップ

### 1. データベース（初回のみ）

MySQL でデータベースとテーブルを作成し、サンプルデータを投入します。

```bash
mysql -u root -p < database/schema.sql
```

環境に合わせて `backend/config/database.php` の接続情報（`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`）を変更してください。環境変数でも指定できます。

### 2. フロントエンドの依存関係（初回のみ）

```bash
cd frontend && npm install && cd ..
```

### 3. 起動

**プロジェクトルートで:**

```bash
npm run dev
```

これだけで PHP API（localhost:8080）と React（Vite）が同時に起動します。ブラウザで表示される URL（例: http://localhost:5173）を開いてください。Vite の proxy で `/api` が PHP に転送されます。

---

**従来どおり別々に起動する場合**

- バックエンド: `npm run dev:backend`（PHP のみ）
- フロントエンド: `npm run dev:frontend`（Vite のみ）

## 使い方

1. 車種を選ぶと、燃費・排気量・車両価格・車検費用が自動入力されます。
2. 年間走行距離・ガソリン価格・保険・駐車場などを入力し、「計算」をクリックします。
3. 年間維持費・月間維持費と内訳（円グラフ・リスト）が表示されます。

## プロジェクト構成

```
car-cost-simulator/
├── frontend/          # React (Vite)
├── backend/           # PHP API (api/cars.php, api/calc.php)
├── database/          # schema.sql
└── README.md
```
