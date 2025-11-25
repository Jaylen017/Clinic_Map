# ClinicFinder 3D - 设置指南

## 前置要求

在开始之前，请确保已安装：

- **Node.js** 18+ 和 npm
- **PostgreSQL** 14+
- **Google Maps API Key** (需要启用以下 API):
  - Places API
  - Geocoding API
  - Maps JavaScript API (可选，用于前端)
- **Mapbox Access Token** (用于 3D 地球地图)

## 快速开始

### 1. 安装依赖

在项目根目录运行：

```bash
npm run install:all
```

这将安装根目录、前端和后端的所有依赖。

### 2. 设置数据库

#### 创建 PostgreSQL 数据库

```bash
# 使用 psql 或 pgAdmin
createdb clinic_finder
```

#### 配置环境变量

复制后端环境变量示例文件：

```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env` 并填入你的配置：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_finder"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
JWT_SECRET="your-random-secret-key"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

#### 运行数据库迁移

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. 配置前端

复制前端环境变量示例文件：

```bash
cd frontend
cp .env.local.example .env.local
```

编辑 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
```

### 4. 获取 API Keys

#### Google Maps API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下 API:
   - Places API
   - Geocoding API
4. 创建凭据 (API Key)
5. 限制 API Key 的使用（推荐）

#### Mapbox Token

1. 访问 [Mapbox](https://www.mapbox.com/)
2. 注册/登录账户
3. 在 [Account page](https://account.mapbox.com/) 获取 Access Token
4. 将 token 添加到 `frontend/.env.local`

### 5. 启动开发服务器

在项目根目录运行：

```bash
npm run dev
```

这将同时启动：
- 前端: http://localhost:3000
- 后端: http://localhost:3001

或者分别启动：

```bash
# 终端 1 - 后端
cd backend
npm run dev

# 终端 2 - 前端
cd frontend
npm run dev
```

## 项目结构

```
Clinic_Map/
├── backend/                 # Express 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑服务
│   │   ├── socket.ts       # WebSocket 配置
│   │   └── server.ts       # 服务器入口
│   ├── prisma/
│   │   ├── schema.prisma   # 数据库模型
│   │   └── seed.ts         # 种子数据
│   └── package.json
├── frontend/               # Next.js 前端
│   ├── app/               # Next.js App Router
│   │   ├── welcome/       # 欢迎页面
│   │   ├── clinic/        # 诊所注册页面
│   │   └── patient/       # 患者地图页面
│   ├── components/        # React 组件
│   ├── lib/               # 工具函数和 API 客户端
│   └── package.json
└── README.md
```

## API 端点

### 诊所相关

- `POST /api/clinic/register` - 注册新诊所
- `GET /api/clinics/search?lat=&lng=&radius=` - 搜索附近诊所
- `GET /api/clinic/:id` - 获取诊所详情
- `GET /api/clinic/:id/timeslots` - 获取可用时间段

### 预约相关

- `POST /api/clinic/:id/book` - 预订时间段

### 用户相关

- `POST /api/signup` - 用户注册
- `POST /api/login` - 用户登录

## 数据库模型

- **User** - 用户（患者和诊所）
- **Clinic** - 诊所信息
- **TimeSlot** - 可用时间段
- **Booking** - 预约记录

## 功能特性

✅ 3D 交互式地球地图 (Mapbox GL JS)  
✅ 真实诊所数据 (Google Maps Places API)  
✅ 实时预约系统 (WebSocket)  
✅ 诊所注册流程  
✅ 患者查找和预约流程  
✅ 时间段实时更新  

## 故障排除

### 数据库连接错误

确保 PostgreSQL 正在运行，并且 `DATABASE_URL` 配置正确。

### Google Maps API 错误

- 检查 API Key 是否正确
- 确保已启用所需的 API
- 检查 API 配额限制

### Mapbox 地图不显示

- 检查 `NEXT_PUBLIC_MAPBOX_TOKEN` 是否正确设置
- 确保 token 有正确的权限

### WebSocket 连接失败

- 确保后端服务器正在运行
- 检查 CORS 配置
- 查看浏览器控制台的错误信息

## 生产部署

### 后端

1. 构建项目：
```bash
cd backend
npm run build
```

2. 使用 PM2 或类似工具运行：
```bash
npm start
```

### 前端

1. 构建项目：
```bash
cd frontend
npm run build
```

2. 启动生产服务器：
```bash
npm start
```

或部署到 Vercel/Netlify 等平台。

## 许可证

MIT

