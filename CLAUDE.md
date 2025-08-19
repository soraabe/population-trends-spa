# Claude Code Project Configuration

## Development Commands

- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Build**: `npm run build`
- **Dev Server**: `npm run dev`

## Commit Message Rules

### Format
```
<type>(<scope>): <description>
```

コミットメッセージは簡潔に日本語で1行で記述する。詳細な説明はPull Requestの説明欄に記載する。

### Types
- **feat**: 新機能の追加
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの意味に影響しない変更（フォーマット、セミコロンなど）
- **refactor**: バグ修正でも機能追加でもないコード変更
- **test**: テストの追加や修正
- **chore**: ビルドプロセスやツールの変更

### Scope (Optional)
- **ui**: UIコンポーネント関連
- **api**: API関連
- **config**: 設定ファイル関連
- **deps**: 依存関係関連

### Examples
```
feat(ui): 都道府県選択チェックボックスを追加
fix(api): エンドポイントのnullデータを処理
docs: READMEを更新
chore(deps): React v19に更新
```

## Pull Request Rules

### Title Format
```
<type>(<scope>): <description>
```

### Description Template
```markdown
## 概要
- [主な変更内容を箇条書きで記載]

## 変更内容
- [具体的な変更内容]

## テスト計画
- [テスト方法やチェック項目]

## スクリーンショット（該当する場合）
[UI変更がある場合はスクリーンショットを添付]
```

### Review Checklist
- [ ] コードが lint を通る
- [ ] テストが通る
- [ ] ドキュメントが更新されている（必要に応じて）
- [ ] 破壊的変更がある場合は明記されている

## Branch Naming Convention

- **feature branches**: `feat/description`
- **bugfix branches**: `fix/description`
- **documentation branches**: `docs/description`
- **chore branches**: `chore/description`

Examples:
- `feat/population-chart`
- `fix/api-error-handling`
- `docs/setup-guide`
- `chore/update-dependencies`
