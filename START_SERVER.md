# 如何启动开发服务器

## 问题：localhost refused to connect

这个错误表示开发服务器没有运行。请按照以下步骤启动：

## 方法 1：使用 npm 脚本（推荐）

### 步骤 1：打开终端/命令提示符

- 在项目根目录 `C:\Users\Jaylen\Desktop\Clinic_Map` 打开终端
- 或者右键点击项目文件夹，选择"在终端中打开"

### 步骤 2：安装依赖（如果还没安装）

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 步骤 3：启动开发服务器

在项目根目录运行：

```bash
npm run dev
```

这将同时启动：
- 前端服务器：http://localhost:3000
- 后端服务器：http://localhost:3001

## 方法 2：分别启动前端和后端

### 终端 1 - 启动后端

```bash
cd backend
npm run dev
```

后端将在 http://localhost:3001 运行

### 终端 2 - 启动前端

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:3000 运行

## 方法 3：如果 npm 命令不可用

### 检查 Node.js 是否安装

1. 打开命令提示符（Win + R，输入 `cmd`）
2. 运行：`node --version`
3. 如果显示版本号，说明已安装
4. 如果没有，需要先安装 Node.js

### 安装 Node.js

1. 访问：https://nodejs.org/
2. 下载 LTS 版本（推荐）
3. 安装后重启终端
4. 验证安装：`node --version` 和 `npm --version`

## 常见问题

### 1. 端口被占用

如果 3000 或 3001 端口被占用，你会看到错误。解决方法：

- 关闭占用端口的程序
- 或者修改端口（在 `package.json` 或 `.env` 文件中）

### 2. 依赖安装失败

```bash
# 清除缓存后重试
npm cache clean --force
npm install
```

### 3. 数据库未启动

确保 PostgreSQL 数据库正在运行（如果使用数据库功能）

## 验证服务器运行

启动后，你应该看到类似这样的输出：

```
🚀 Server running on http://localhost:3001
ready - started server on 0.0.0.0:3000
```

然后在浏览器访问：http://localhost:3000


