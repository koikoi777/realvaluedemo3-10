# Dify ワークフロー API 連携

このプロジェクトは、Difyで作成したワークフローをAPIとして利用し、カスタムフロントエンドと連携するためのアプリケーションです。Next.jsとTailwind CSSを使用して構築されています。

## 機能

- Dify ワークフローAPIの呼び出し
- チャットインターフェース
- 議事録処理ワークフロー連携
- レスポンシブデザイン

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Dify API](https://docs.dify.ai/) - AIワークフローとチャットAPI

## セットアップ

### 前提条件

- Node.js 18.x以上
- npm または yarn
- Difyアカウントとワークフローの作成

### インストール

1. リポジトリをクローン、または新規プロジェクトとして作成

2. 依存関係をインストール
```bash
npm install
# または
yarn install
```

3. 環境変数を設定
`.env.local`ファイルを作成し、以下の変数を設定:
```
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_dify_api_key_here
```

4. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev
```

5. ブラウザで[http://localhost:3000](http://localhost:3000)にアクセス

## 使用方法

1. 「設定」タブでDifyワークフローIDを設定
2. 「ワークフロー実行」タブで議事録テキストを入力し、処理を実行
3. 「チャットインターフェース」タブでDifyチャットボットと対話

## カスタマイズ

- `app/components/WorkflowRunner.tsx` - ワークフロー実行コンポーネントのカスタマイズ
- `app/components/ChatInterface.tsx` - チャットインターフェースのカスタマイズ
- `app/api/dify/` - Dify API連携のカスタマイズ

## デプロイ

Vercelへのデプロイを推奨します：

### GitHubを使用する方法（推奨）

1. GitHubリポジトリを作成
2. [Vercel](https://vercel.com/)にアカウント登録
3. 「New Project」をクリック
4. GitHubリポジトリをインポート
5. 環境変数を設定（DIFY_API_URL, DIFY_API_KEY）
6. デプロイボタンをクリック

### Vercel CLIを使用する方法

```bash
npm install -g vercel
vercel login
vercel
```

## ライセンス

MIT
