# Vercelデプロイマニュアル

## 📋 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [デプロイ方法](#デプロイ方法)
4. [トラブルシューティング](#トラブルシューティング)
5. [エラー備忘録](#エラー備忘録)
6. [継続的デプロイ](#継続的デプロイ)

## 🎯 概要

このマニュアルは静的サイト（HTML/CSS/JS）をVercelにデプロイする手順を説明します。
特にPyodideを使用したWebアプリケーションの場合の設定も含みます。

## 📋 前提条件

### 必要なツール
- Node.js 16.0.0以上
- Git
- GitHub アカウント
- Vercel アカウント（GitHub連携推奨）

### 必要なファイル
```
project/
├── index.html          # エントリーポイント
├── styles.css          # スタイルシート  
├── script.js           # JavaScript
├── vercel.json         # Vercel設定（オプション）
├── package.json        # プロジェクト設定
└── README.md           # ドキュメント
```

## 🚀 デプロイ方法

### 方法1: Vercel CLI（推奨）

#### 1. Vercel CLIインストール
```bash
npm install -g vercel
```

#### 2. プロジェクトディレクトリに移動
```bash
cd /path/to/your/project
```

#### 3. Vercelにログイン
```bash
vercel login
```
- ブラウザが開くのでGitHubアカウントで認証

#### 4. 初回デプロイ
```bash
vercel --yes
```

#### 5. 本番デプロイ
```bash
vercel --prod --yes
```

### 方法2: GitHub連携（継続的デプロイ）

#### 1. GitHubリポジトリ作成
```bash
# ローカルでGit初期化
git init
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git remote add origin https://github.com/username/repo-name.git
git branch -M main
git push -u origin main
```

#### 2. Vercel Web UIでインポート
1. [vercel.com](https://vercel.com) にアクセス
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Deploy」をクリック

### 方法3: ドラッグ&ドロップ（簡単）

#### 1. プロジェクトをZIP化
```bash
zip -r project-deploy.zip project/ -x "project/.git/*"
```

#### 2. Vercel Web UIでデプロイ
1. [vercel.com](https://vercel.com) にアクセス
2. ZIPファイルをドラッグ&ドロップ
3. 自動でデプロイ開始

## 🔧 vercel.json設定

### 基本設定（静的サイト）
```json
{
  "buildCommand": "echo 'No build needed for static site'",
  "outputDirectory": ".",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Pyodide用設定（WebAssembly対応）
```json
{
  "buildCommand": "echo 'No build needed for static site'",
  "outputDirectory": ".",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. 認証エラー
```
Error: The specified token is not valid
```
**解決方法**: 
```bash
vercel login
```

#### 2. ビルドディレクトリエラー
```
Error: No Output Directory named "public" found
```
**解決方法**: vercel.jsonに追加
```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": "."
}
```

#### 3. CORS/PyodideエラーH
**症状**: Pyodideが読み込めない
**解決方法**: 適切なヘッダー設定
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy", 
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

#### 4. Git認証エラー（SSH）
```
fatal: could not read Username for 'https://github.com'
```
**解決方法**: SSH URLに変更
```bash
git remote set-url origin git@github.com:username/repo.git
```

## 📝 エラー備忘録

### 実際に発生したエラーと対処法

#### エラー1: vercel.json設定競合
```
Error: The `functions` property cannot be used in conjunction with the `builds` property
```

**原因**: vercel.jsonで`builds`と`functions`を同時使用
**対処法**: 静的サイトでは`builds`と`functions`を削除

**修正前**:
```json
{
  "builds": [...],
  "functions": {...}
}
```

**修正後**:
```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": "."
}
```

#### エラー2: 正規表現パターンエラー
```
Error: Header at index 1 has invalid `source` pattern "/(.*\.(js|css|wasm|data))"
```

**原因**: Vercelの正規表現パターンが無効
**対処法**: 正しい正規表現に修正

**修正前**:
```json
{
  "source": "/(.*\\.(js|css|wasm|data))"
}
```

**修正後**:
```json
{
  "source": "/(.*\\.(?:js|css|wasm|data))$"
}
```

#### エラー3: Git認証エラー
```
fatal: could not read Username for 'https://github.com': Device not configured
```

**原因**: HTTPS認証設定がない
**対処法**: SSH認証に変更
```bash
git remote set-url origin git@github.com:username/repo.git
```

#### エラー4: Vercel CLI確認エラー
```
Error: Command `vercel deploy` requires confirmation. Use option "--yes" to confirm.
```

**原因**: 対話式確認が必要
**対処法**: `--yes`オプション追加
```bash
vercel --prod --yes
```

#### エラー5: ビルド出力ディレクトリエラー
```
Error: No Output Directory named "public" found after the Build completed
```

**原因**: Vercelが`public`ディレクトリを期待している
**対処法**: `outputDirectory`を現在ディレクトリに設定
```json
{
  "outputDirectory": "."
}
```

## 🔄 継続的デプロイ

### GitHub連携後の更新手順
```bash
# コード修正後
git add .
git commit -m "Update: 修正内容"
git push origin main

# 自動でVercelにデプロイされる
```

### 手動デプロイ（CLI）
```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

## 📊 デプロイ結果の確認

### 成功時の出力例
```
Production: https://your-app-xxx.vercel.app
Inspect: https://vercel.com/your-username/your-app/deployment-id
```

### ログの確認
1. Vercel ダッシュボードにアクセス
2. プロジェクトを選択
3. 「Functions」タブでログ確認

## 🎯 ベストプラクティス

### 1. プロジェクト構造
```
project/
├── index.html          # エントリーポイント
├── assets/             # 静的ファイル
│   ├── styles.css
│   └── script.js
├── vercel.json         # Vercel設定
├── package.json        # プロジェクト情報
└── README.md           # ドキュメント
```

### 2. vercel.json最小構成
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 3. 環境変数設定
```bash
# Vercel CLI
vercel env add VARIABLE_NAME

# または Web UI で設定
```

### 4. カスタムドメイン設定
1. Vercel ダッシュボード
2. プロジェクト選択
3. 「Settings」→「Domains」
4. カスタムドメイン追加

## 🆘 サポート

### 公式ドキュメント
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

### コミュニティ
- [Vercel GitHub Discussions](https://github.com/vercel/vercel/discussions)
- [Discord Server](https://vercel.com/discord)

---

**最終更新**: 2025年7月5日
**作成者**: Python Web Runner Team