# bxuanz.github.io

赵炳轩的个人主页，Astro 静态站，中英双语，部署在 GitHub Pages：<https://bxuanz.github.io/>

## 改内容

所有正文内容都在 `src/content/data/` 下的 YAML 里，改完 push 就自动上线，不用碰任何 `.astro` 文件。

| 文件 | 内容 |
| --- | --- |
| `profile.yaml` | 姓名、头衔、单位、头像、邮箱与各种链接 |
| `focus-areas.yaml` | 研究兴趣 |
| `publications.yaml` | 论文列表（顺序即网页顺序） |
| `education.yaml` | 教育背景 |
| `honors.yaml` | 荣誉奖项 |
| `interests.yaml` | 「研究之外」 |

每条中英文字段（`en` / `zh`）都是必填，漏一个构建会直接失败并指出是哪一行，不会静默渲染半边空白。

「近期动态」没有独立数据文件，它是从 `publications.yaml` 和 `honors.yaml` 自动派生的。

界面文案（导航、按钮、小标签）在 `src/i18n/ui.ts`。

## 本地预览

需要 Node 22（版本记录在 `.nvmrc`）。

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
npm run preview  # 预览 build 产物
```

## 部署

push 到 `main` 就由 `.github/workflows/deploy.yml` 构建并发布，无需手动操作。

仓库的 **Settings → Pages → Build and deployment → Source** 必须设为 **GitHub Actions**。
