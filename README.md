# 都道府県別人口推移グラフ

都道府県別の人口推移をグラフで表示するSPA(Single Page Application)です。

## 🌟 機能

- ✅ 都道府県一覧のチェックボックス選択
- 📊 人口推移グラフの表示（Recharts使用）
- 🔄 人口種別の切り替え（総人口/年少人口/生産年齢人口/老年人口）
- 📱 レスポンシブデザイン対応
- 🎨 複数都道府県の同時比較表示
- 🤖 **AI自然言語クエリ機能** - 自然言語で県選択（例：「人口が多い県5つ」「関西地方」）

## 🚀 デプロイ

- **本番環境**: [Vercel本番URL](https://vercel.com/dashboard) (mainブランチから自動デプロイ)
- **プレビュー**: PRごとに自動でプレビューURLが生成されます

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **グラフライブラリ**: Recharts
- **ビルドツール**: Vite
- **リンター**: ESLint + Prettier
- **テスト**: Vitest + Testing Library
- **デプロイ**: Vercel + GitHub Actions
- **API**: ゆめみフロントエンドコーディング試験 API
- **AI**: Google Generative AI (Gemini)

## 📦 セットアップ

### 基本セットアップ

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

### 環境変数設定（AI機能使用時）

```bash
# .envファイルを作成
VITE_API_KEY=your_yumemi_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# AI分析サーバーの起動（別ターミナル）
npm run dev:server

# フロントエンド+AI両方起動
npm run dev:full
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
  ├── components/              # UIコンポーネント
  │   ├── PrefectureList.tsx        # 都道府県選択チェックボックス
  │   ├── PopulationChart.tsx       # 人口推移グラフ表示
  │   ├── AIQueryInput.tsx          # AI自然言語クエリ入力
  │   ├── AnalysisInsight.tsx       # AI分析結果表示
  │   └── tests/               # コンポーネントテスト
  ├── services/               # ビジネスロジック層
  │   ├── ai-service.ts            # AI API通信サービス
  │   ├── data-analyzer.ts         # 人口データ分析エンジン
  │   └── query-processor.ts       # 自然言語クエリ処理
  ├── hooks/                  # カスタムReactフック
  │   ├── usePopulationApp.ts      # アプリ全体の状態管理
  │   ├── usePopulationData.ts     # 人口データ取得
  │   ├── usePrefectures.ts        # 都道府県データ取得
  │   └── useResponsive.ts         # レスポンシブ対応
  ├── domain/                 # ドメイン駆動設計層
  │   ├── hooks/
  │   ├── models/
  │   └── services/
  ├── infrastructure/         # インフラストラクチャ層
  │   └── api/
  ├── lib/                   # ユーティリティ関数
  │   ├── colors.ts               # カラーパレット
  │   └── transform.ts            # データ変換
  ├── types/                 # TypeScript型定義
  │   └── api.ts
  └── App.tsx               # メインアプリケーション

  api/                      # Vercel Serverless Functions
  ├── prefectures.mjs           # 都道府県一覧API
  ├── analyze.mjs              # AI分析API
  └── population/
      └── composition/
          └── perYear.mjs          # 年別人口構成API

  server/                   # AI分析サーバー（開発時）
  ├── index.js                 # Express サーバー
  └── api.js                  # AI分析エンドポイント
```

## 🤖 AI自然言語クエリ機能

自然言語での県選択が可能です：

### 使用例
- **「人口が多い県5つ」** → 東京都、神奈川県、大阪府、愛知県、埼玉県を自動選択
- **「関西地方を選択」** → 滋賀県、京都府、大阪府、兵庫県、奈良県、和歌山県を選択
- **「九州で年少人口が少ない県3選」** → データに基づいて年少人口の少ない順に3県を選択

### 技術詳細
- Google Generative AI (Gemini) を使用
- サーバーサイドでAI処理（APIキー保護）
- 詳細な分析結果とインサイト表示

## 📊 API仕様

### 人口データAPI
ゆめみフロントエンドコーディング試験APIを使用：

- 都道府県一覧取得: `/api/v1/prefectures`
- 人口構成取得: `/api/v1/population/composition/perYear`

### AI分析API
- AI分析: `POST /api/analyze`
- リクエスト: `{ query: string, dataContext: string }`
- レスポンス: `{ selectedPrefectures: number[], title: string, description: string, insights: object[] }`
