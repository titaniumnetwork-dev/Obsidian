# Obsidian
Play instantly. No downloads.



## Setup

### Setup Cloudflare R2 Bucket
- Create Bucket
- Bucket name "files"
- Back to R2 overview
- Click Manage API Tokens
- Copy "S3 API" URL
- Create Account API Token
- Name: File uploader (or whatever)
- Permissions: "Object Read & Write"
- Apply to specific buckets only: "files"
- Save "Access Key ID" and "Secret Access Key"
- Download Rclone

Windows
```bash
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

MacOS
```bash
brew install rclone
```

### Setup Rclone Conenction to Cloudflare R2
- Run `rclone config`
- New remote (n)
- Name: files
- Type of storage: S3 (Option 4)
- Provider: Cloudfare R2 (Option 7)
- env_auth: Type false
- access_key_id: Paste your Access Key ID.
- secret_access_key: Paste your Secret Access Key.
- Region: Auto (1)
- Endpoint: Paste your S3 API URL (keep the https://).
- Edit advance config: No (n)
- Keep this "files" remote: Yes this is OK (y)
- Quit (q)

### Upload Games
Run `rclone sync ./ files:files --progress --transfers 10 --exclude-from .rclone-ignore` in the games folder directory

.rclone-ignore
```
.DS_Store
**/.DS_Store
README.md
.rclone-ignore
.gitignore
```

### Deploy with Wrangler
- Make sure your logged in with `wranger login`
- Run `pnpm run deploy` to deploy with Cloudflare Pages
- "Create a new project" if needed and enter the production branch name `main`

## Google AdSense
- Place ads.txt inside the `/static/` folder
- Use PUBLIC_ADSENSE_PUB_ID inside `.env`

## Todo
- Put collections in DB
- Search tags (also creator)
- Emulator based controls for retro games
- Rebind controller keybinds in creator
- Other controller types
- Overlay game menu
- Script to format and validate catalog and sort by a-z

# License
Obsidian uses the Apache 2.0 with Commons Clause v1.0. Commercial use is strictly prohibited.