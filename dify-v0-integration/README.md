# Dify API 統合アプリケーション

このアプリケーションは、[Dify](https://dify.ai/)のAPIを使用して、AIチャットとワークフローを実行するためのシンプルなインターフェースを提供します。

## 機能

- Dify AIチャットモデルとの対話
- Dify ワークフローの実行（ブロッキングモードとストリーミングモード）
- ファイルのアップロードとワークフローへの送信
- 動的な入力フィールドの設定

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- Dify APIキー

### インストール

1. リポジトリをクローン:

```bash
git clone <repository-url>
cd dify-v0-integration
```

2. 依存関係をインストール:

```bash
npm install
# または
yarn install
```

3. 環境変数を設定:

`.env.local` ファイルを作成し、以下の変数を設定:

```
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_dify_api_key
```

4. 開発サーバーを起動:

```bash
npm run dev
# または
yarn dev
```

## 使用方法

### チャットインターフェース

チャットインターフェースでは、Difyで作成したAIアプリケーションと対話できます。

1. メッセージを入力フィールドに入力
2. 「送信」ボタンをクリックしてメッセージを送信
3. AIからの応答が表示されます

### ワークフロー実行

ワークフローインターフェースでは、Difyで作成したワークフローを実行できます。

1. ワークフローIDを入力（Difyダッシュボードで確認可能）
2. レスポンスモードを選択（ブロッキングまたはストリーミング）
3. 必要な入力フィールドに値を入力
4. ファイルをアップロードする場合は、テキストエリアの右下にあるアップロードボタンをクリック
5. 「実行」ボタンをクリックしてワークフローを実行
6. 結果が表示されます

## ファイルアップロード

ワークフローにファイルを送信するには、以下の手順に従います：

1. テキストエリアの右下にあるアップロードボタンをクリック
2. ローカルファイルを選択するか、ファイルURLを入力
3. ファイルがアップロードされると、入力フィールドに表示され、ワークフロー実行時に自動的に送信されます

サポートされているファイル形式:
- 画像: jpg, jpeg, png, gif, webp, svg
- ドキュメント: pdf, txt, docx, doc, xlsx, xls, csv
- 音声: mp3, m4a, wav, webm, amr
- 動画: mp4, mov, mpeg, mpga

## API仕様

### チャットAPI

```typescript
POST /api/dify/chat
{
  "message": "こんにちは",
  "inputs": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### ワークフローAPI

```typescript
POST /api/dify/workflow
{
  "workflowId": "your_workflow_id",
  "inputs": {
    "key1": "value1",
    "key2": "value2",
    "file_input": {
      "transfer_method": "local_file",
      "upload_file_id": "file_id_from_upload_api",
      "type": "document"
    }
  },
  "response_mode": "blocking" // または "streaming"
}
```

### ファイルアップロードAPI

```typescript
POST /api/dify/files/upload
Content-Type: multipart/form-data

file: <file>
user: <user_id>
type: <document|image|audio|video>
```

## Dify APIリファレンス

詳細なAPIリファレンスについては、[Dify API Documentation](https://docs.dify.ai/api-reference/overview)を参照してください。

## デプロイ

### Vercelへのデプロイ

このアプリケーションは、Vercelに簡単にデプロイできます。

1. [Vercel](https://vercel.com)にアクセスし、アカウントを作成またはログイン
2. 「New Project」をクリック
3. リポジトリをインポート
4. 環境変数を設定:
   - `DIFY_API_URL` = `https://api.dify.ai/v1`
   - `DIFY_API_KEY` = あなたのDify APIキー
5. 「Deploy」をクリック

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [React](https://reactjs.org/) - UIライブラリ
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [Axios](https://axios-http.com/) - HTTPクライアント
- [React Markdown](https://github.com/remarkjs/react-markdown) - マークダウンレンダリング

## ライセンス

MIT
