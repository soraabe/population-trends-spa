# 都道府県別人口推移グラフ

ゆめみフロントエンドコーディング試験の課題として作成した、都道府県別の人口推移をグラフで表示するSPA(Single Page Application)です。

## 🌟 機能

- ✅ 都道府県一覧のチェックボックス選択
- 📊 人口推移グラフの表示（Recharts使用）
- 🔄 人口種別の切り替え（総人口/年少人口/生産年齢人口/老年人口）
- 📱 レスポンシブデザイン対応
- 🎨 複数都道府県の同時比較表示

## 🚀 デプロイ

- **本番環境**: https://population-trends-spa.vercel.app (mainブランチから自動デプロイ)
- **プレビュー**: PRごとに自動でプレビューURLが生成されます

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **グラフライブラリ**: Recharts
- **ビルドツール**: Vite
- **リンター**: ESLint + Prettier
- **テスト**: Vitest + Testing Library
- **デプロイ**: Vercel + GitHub Actions
- **API**: ゆめみフロントエンドコーディング試験 API

## 📦 セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テスト実行
npm test

# リント
npm run lint

# フォーマット
npm run format
```

## 🧪 CI/CD

GitHub Actionsにより以下が自動実行されます：

1. **テスト・品質チェック** (すべてのプッシュ・PR)
   - TypeScript型チェック
   - ESLint実行
   - Prettier確認
   - ユニットテスト実行
   - ビルドテスト

2. **デプロイ** (mainブランチへのプッシュ時)
   - Vercelへの本番デプロイ
   - 自動でURLが更新

## 📱 対応環境

- Google Chrome最新版
- PC・スマートフォン表示対応

## 🏗️ アーキテクチャ

```
src/
├── components/          # Reactコンポーネント
│   ├── PrefectureList.tsx    # 都道府県選択
│   ├── PopulationChart.tsx   # グラフ表示
│   └── __tests__/           # テストファイル
├── types/              # TypeScript型定義
│   └── api.ts
├── lib/               # ユーティリティ関数
└── App.tsx           # メインアプリケーション
```

## 📊 API仕様

ゆめみフロントエンドコーディング試験APIを使用：
- 都道府県一覧取得: `/api/v1/prefectures`
- 人口構成取得: `/api/v1/population/composition/perYear`
