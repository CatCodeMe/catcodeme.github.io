# EdgeOne Pages 部署说明

## EdgeOne CLI 安装

EdgeOne CLI 已添加到 `devDependencies` 中，运行 `bun install` 时会自动安装。

如果需要在本地使用，也可以全局安装：

```bash
npm install -g edgeone
# 或
bun add -g edgeone
```

## GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets：

1. **EDGEONE_API_TOKEN**
   - EdgeOne API Token
   - 获取方式：EdgeOne 控制台 → API 密钥

2. **EDGEONE_PROJECT_NAME**
   - EdgeOne Pages 项目名称
   - 在 EdgeOne 控制台创建 Pages 项目时设置

## 部署命令说明

```bash
edgeone pages deploy <outputDirectory> -n <projectName> -t <token> [-e <env>]
```

参数说明：
- `dist`: 构建输出目录（Astro 默认输出目录）
- `-n`: 项目名称（从 GitHub Secrets 获取）
- `-t`: API Token（从 GitHub Secrets 获取）
- `-e`: 环境（可选，如 production/staging）

## 工作流程

1. **推送代码** → 触发 GitHub Actions
2. **安装依赖** → 包括 edgeone CLI
3. **构建项目** → 生成 dist 目录
4. **字体子集化** → 自动运行（通过 Astro 集成）
5. **部署** → 使用 edgeone CLI 部署到 EdgeOne Pages

## 本地测试部署

如果需要本地测试部署：

```bash
# 确保已安装依赖
bun install

# 构建项目
bun run build

# 部署（需要设置环境变量或直接传参）
bunx edgeone pages deploy dist -n <项目名称> -t <API_TOKEN>
```

## 注意事项

1. EdgeOne CLI 已添加到 `devDependencies`，不需要全局安装
2. 在 GitHub Actions 中使用 `bunx edgeone` 会自动使用项目中的版本
3. 确保 GitHub Secrets 已正确配置
4. 部署前会验证构建输出和字体文件
