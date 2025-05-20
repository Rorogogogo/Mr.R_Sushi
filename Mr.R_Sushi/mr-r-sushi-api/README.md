# Mr.R 寿司 后端 API

这是 Mr.R 寿司网站的后端 API，使用.NET Core 9 和 SQLite 数据库构建。

## 技术栈

- .NET Core 9
- Entity Framework Core
- SQLite 数据库

## 项目结构

- `Controllers/` - API 控制器
- `Data/` - 数据上下文和数据库配置
- `Models/` - 数据模型
  - `DTOs/` - 数据传输对象

## 功能

1. 菜单管理

   - 获取所有菜单项
   - 按 ID 获取菜单项
   - 按类别获取菜单项
   - 获取热门菜品

2. 订单管理
   - 创建新订单
   - 获取所有订单
   - 获取订单详情
   - 更新订单状态

## 如何运行

1. 确保已安装.NET Core 9 SDK

2. 导航到项目目录：

   ```
   cd Mr.R_Sushi/mr-r-sushi-api/MrRSushiApi
   ```

3. 首次运行会自动创建 SQLite 数据库并填充示例数据

4. 启动 API：

   ```
   dotnet run
   ```

5. API 将在以下地址运行：
   - http://localhost:5000
   - https://localhost:5001

## API 端点

### 菜单 API

- GET `/api/menu` - 获取所有菜单项
- GET `/api/menu/{id}` - 通过 ID 获取指定菜单项
- GET `/api/menu/category/{category}` - 获取指定分类的菜单项
- GET `/api/menu/popular` - 获取热门菜品

### 订单 API

- GET `/api/order` - 获取所有订单
- GET `/api/order/{id}` - 获取指定订单的详情
- POST `/api/order` - 创建新订单
- PUT `/api/order/{id}/status` - 更新订单状态
