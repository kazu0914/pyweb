# 🐍 Python Web Runner

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/python-web-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

ブラウザ上でPythonコードを実行できる Web アプリケーション

## ✨ 特徴

- 🚀 **ブラウザで完結**: インストール不要、ブラウザだけでPython実行
- 📦 **自動パッケージ管理**: NumPy、pandas等の主要ライブラリを自動インストール
- 📄 **ファイル出力機能**: 作成したファイルを直接ダウンロード可能
- 📱 **レスポンシブ対応**: PC・タブレット・スマートフォンに対応
- ⚡ **高速実行**: WebAssembly技術により高速なコード実行
- 🎨 **モダンUI**: 洗練されたユーザーインターフェース

## 🎯 対象ユーザー

- Python学習者・初心者
- データサイエンティスト
- 教育関係者
- プロトタイピングを行う開発者
- 環境構築なしでPythonを試したい方

## 🚀 デモ

[https://python-web-runner.vercel.app](https://python-web-runner.vercel.app)

## 📦 利用可能なライブラリ

### ✅ 利用可能
- **数値計算**: numpy, scipy
- **データ分析**: pandas
- **可視化**: matplotlib
- **機械学習**: scikit-learn
- **Web関連**: requests, beautifulsoup4
- **その他**: sympy, networkx, pillow, lxml

### ❌ 利用不可
- **深層学習**: tensorflow, pytorch
- **画像処理**: opencv-python
- **ファイル操作**: python-docx, openpyxl
- **データベース**: psycopg2, mysql-connector
- **システム**: threading, multiprocessing, subprocess

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, ES6+
- **Python実行環境**: [Pyodide](https://pyodide.org/) (WebAssembly)
- **デザイン**: CSS Variables, Flexbox, Grid
- **デプロイ**: Vercel
- **開発ツール**: ESLint, Prettier

## 📁 プロジェクト構造

```
pyweb/
├── index.html          # メインHTML
├── styles.css          # スタイルシート
├── script.js           # メインJavaScript
├── vercel.json         # Vercel設定
├── package.json        # プロジェクト設定
└── README.md           # このファイル
```

## 🚀 開発環境セットアップ

### 前提条件
- Node.js 16.0.0以上
- npm 7.0.0以上

### セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yourusername/python-web-runner.git
   cd python-web-runner
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

## 📝 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# コードフォーマット
npm run format

# リンター実行
npm run lint
npm run lint:fix

# HTMLバリデーション
npm run validate

# Vercelにデプロイ
npm run deploy
```

## 🌐 Vercelデプロイ

### 自動デプロイ
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/python-web-runner)

### 手動デプロイ

1. **Vercel CLIのインストール**
   ```bash
   npm install -g vercel
   ```

2. **デプロイ実行**
   ```bash
   vercel --prod
   ```

## 🎮 使用方法

1. **コード入力**: エディタエリアにPythonコードを入力
2. **実行**: 「実行」ボタンをクリックまたは `Ctrl+Enter`
3. **結果確認**: 実行結果エリアで出力を確認
4. **ファイルダウンロード**: 作成されたファイルをダウンロード

### サンプルコード

```python
import numpy as np
import matplotlib.pyplot as plt

# データ生成
x = np.linspace(0, 2*np.pi, 100)
y = np.sin(x)

# グラフ作成
plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sine Wave')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)
plt.show()

# ファイル保存
data = f\"x,y\\n\"
for i in range(len(x)):
    data += f\"{x[i]:.3f},{y[i]:.3f}\\n\"

save_file('sine_data.csv', data)
```

## 🔧 カスタマイズ

### テーマ変更
`styles.css`の`:root`セクションでCSS変数を変更:

```css
:root {
  --primary-color: #your-color;
  --background-color: #your-background;
}
```

### 新しいライブラリ追加
`script.js`の`getPackageConfig()`メソッドで設定:

```javascript
pyodidePackages: {
  'your-package': 'package-name'
}
```

## 🤝 コントリビューション

1. フォークを作成
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 🐛 バグレポート・機能要望

[Issues](https://github.com/yourusername/python-web-runner/issues) でバグレポートや機能要望をお知らせください。

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🙏 謝辞

- [Pyodide](https://pyodide.org/) - WebAssembly版Python実行環境
- [Vercel](https://vercel.com/) - 静的サイトホスティング
- すべてのコントリビューター

## 📞 サポート

- 📧 Email: contact@pythonwebrunner.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/python-web-runner/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/yourusername/python-web-runner/wiki)

---

**🚀 Python Web Runner で、どこでもPythonプログラミングを楽しもう！**