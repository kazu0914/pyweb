# Vercelデプロイ エラー備忘録

## 📅 発生日時
**2025年7月5日 12:00-13:00 JST**

## 🎯 実行内容
Python Web Runner プロジェクトをVercelにデプロイ

## ⚠️ 発生したエラー一覧

### 1. Git認証エラー
```bash
fatal: could not read Username for 'https://github.com': Device not configured
```

**発生タイミング**: `git push -u origin main` 実行時
**原因**: HTTPSでのGitHub認証設定がない
**解決方法**: SSH認証に変更
```bash
git remote set-url origin git@github.com:kazu0914/pyweb.git
git push -u origin main
```
**結果**: ✅ 正常にプッシュ完了

### 2. Vercel認証エラー
```bash
Error: The specified token is not valid. Use `vercel login` to generate a new token.
```

**発生タイミング**: `vercel --prod --yes` 実行時
**原因**: Vercel CLIにログインしていない
**解決方法**: GitHubアカウントでログイン
```bash
vercel login
# → Continue with GitHub を選択
# → ブラウザでGitHub認証完了
```
**結果**: ✅ ログイン成功

### 3. Vercel設定競合エラー
```bash
Error: The `functions` property cannot be used in conjunction with the `builds` property. 
Please remove one of them.
```

**発生タイミング**: 初回デプロイ時
**原因**: vercel.jsonで`builds`と`functions`プロパティを同時使用
**問題のコード**:
```json
{
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```
**解決方法**: 静的サイトなので両方削除
```json
{
  "headers": [...],
  "trailingSlash": false
}
```
**結果**: ✅ 設定競合解決

### 4. 正規表現パターンエラー
```bash
Error: Header at index 1 has invalid `source` pattern "/(.*\.(js|css|wasm|data))".
```

**発生タイミング**: ヘッダー設定時
**原因**: Vercelで無効な正規表現パターン
**問題のコード**:
```json
{
  "source": "/(.*\\.(js|css|wasm|data))"
}
```
**解決方法**: 正しい正規表現に修正
```json
{
  "source": "/(.*\\.(?:js|css|wasm|data))$"
}
```
**結果**: ✅ 正規表現パターン修正

### 5. ビルド出力ディレクトリエラー
```bash
Error: No Output Directory named "public" found after the Build completed. 
You can configure the Output Directory in your Project Settings.
```

**発生タイミング**: ビルドプロセス実行時
**原因**: Vercelが`public`ディレクトリを期待しているが、静的サイトはルートディレクトリ
**解決方法**: 適切なビルド設定を追加
```json
{
  "buildCommand": "echo 'No build needed for static site'",
  "outputDirectory": "."
}
```
**結果**: ✅ ビルド設定修正

### 6. Vercel CLI確認エラー
```bash
Error: Command `vercel deploy` requires confirmation. Use option "--yes" to confirm.
```

**発生タイミング**: `vercel --prod` 実行時
**原因**: 対話式確認が必要
**解決方法**: `--yes`オプション追加
```bash
vercel --prod --yes
```
**結果**: ✅ 自動確認設定

## 🔧 最終的な vercel.json 設定

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
        }
      ]
    }
  ]
}
```

## ✅ 最終的な成功コマンド

```bash
# 1. Git初期化・プッシュ
git init
git add .
git commit -m "Initial commit: Python Web Runner"
git remote add origin git@github.com:kazu0914/pyweb.git
git branch -M main
git push -u origin main

# 2. Vercelログイン
vercel login
# → GitHub認証

# 3. Vercelデプロイ
vercel --prod --yes
```

## 🎯 学んだポイント

### 1. Git認証について
- **HTTPS認証**: Personal Access Tokenまたは認証設定が必要
- **SSH認証**: 既存のSSHキーがあれば簡単
- **推奨**: SSHキーを使用（一度設定すれば永続）

### 2. Vercel設定について
- **静的サイト**: `builds`や`functions`は不要
- **Pyodide**: `Cross-Origin-*`ヘッダーが必須
- **正規表現**: Vercel独自の制約がある

### 3. デプロイフロー
1. ローカル開発・テスト
2. Git初期化・コミット
3. GitHubにプッシュ
4. Vercel CLI でデプロイ
5. 設定調整・再デプロイ

### 4. エラー対処法
- **段階的解決**: 一つずつエラーを解決
- **ログ確認**: Vercelのビルドログを詳細確認
- **設定最小化**: 不要な設定は削除

## 🔄 継続的デプロイ設定

### GitHub Actions（オプション）
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

### Vercel自動デプロイ
GitHub連携により、`git push`で自動デプロイが有効化済み

## 📊 実行時間とリソース

- **総所要時間**: 約60分
- **エラー回数**: 6回
- **最終成功**: 7回目
- **学習コスト**: 高（初回設定）
- **今後の作業**: 低（自動化済み）

## 🎉 最終成果

**本番サイトURL**: https://python-web-runner-2p6cad3tw-kazunoritani04-gmailcoms-projects.vercel.app
**GitHubリポジトリ**: https://github.com/kazu0914/pyweb

---

**記録者**: Claude Code Assistant  
**記録日**: 2025年7月5日  
**プロジェクト**: Python Web Runner