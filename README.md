# ClinicFinder 3D

一个帮助患者找到附近真实诊所并在交互式3D地球地图上查看可用预约时段的完整Web应用程序。

## 功能特性

- 🌍 **交互式地图** - 使用 Leaflet + OpenStreetMap（完全免费，无需 API key）
- 🏥 **真实诊所数据** - 从 Google Maps Places API 获取真实诊所信息
- 📅 **预约系统** - 实时查看和预订可用时间段
- ⚡ **实时更新** - 使用 WebSocket 实时同步预约状态
- 👥 **双用户流程** - 支持诊所注册和患者预约两种流程

## 技术栈

### 前端
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Leaflet + OpenStreetMap (免费开源)
- React Query
- Axios

### 后端
- Node.js + Express
- PostgreSQL
- Prisma ORM
- Socket.io (WebSocket)
- Google Maps APIs

## 项目结构

```
Clinic_Map/
├── frontend/          # Next.js 前端应用
├── backend/           # Express 后端服务
├── .env.example       # 环境变量示例
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 14+
- Google Maps API Key（需要启用 Places API 和 Geocoding API）

### 安装步骤

1. **安装所有依赖**
```bash
npm run install:all
```

2. **配置环境变量**

复制 `.env.example` 到 `backend/.env` 和 `frontend/.env.local`，并填入你的配置：

```bash
# 后端 .env
DATABASE_URL="postgresql://user:password@localhost:5432/clinic_finder"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
JWT_SECRET="your-jwt-secret"
PORT=3001

# 前端 .env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
# 注意：不再需要 Google Maps API key！现在使用免费的 OpenStreetMap
```

3. **设置数据库**

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. **启动开发服务器**

```bash
npm run dev
```

前端将在 http://localhost:3000 运行
后端将在 http://localhost:3001 运行

## API 端点

### 诊所相关
- `POST /api/clinic/register` - 注册新诊所
- `GET /api/clinics/search?lat=&lng=&radius=` - 搜索附近诊所
- `GET /api/clinic/:id` - 获取诊所详情
- `GET /api/clinic/:id/timeslots` - 获取诊所可用时间段

### 预约相关
- `POST /api/clinic/:id/book` - 预订时间段

### 用户相关
- `POST /api/signup` - 用户注册
- `POST /api/login` - 用户登录

## 使用说明

### 诊所端
1. 访问网站，点击 "I am a Clinic / Hospital"
2. 填写诊所信息（名称、地址、联系方式等）
3. 设置可用时间段和营业时间
4. 提交后诊所将出现在地图上

### 患者端
1. 访问网站，点击 "I am a Patient"
2. 允许浏览器获取位置或手动输入地址
3. 在3D地图上查看附近诊所
4. 点击诊所标记查看详情和可用时间段
5. 选择时间段并完成预约

## 开发

### 数据库迁移
```bash
cd backend
npx prisma migrate dev --name migration_name
```

### 生成 Prisma Client
```bash
cd backend
npx prisma generate
```

## 许可证

MIT
