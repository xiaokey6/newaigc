# AIGC旅游规划系统后端

基于Python+Flask的智能旅游规划系统，集成qwen3-max和高德地图API，提供智能化的旅游方案生成和动态调整功能。

## 🚀 快速开始

### 1. 环境准备

```bash
# 创建虚拟环境（如果还没有）
python -m venv .venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置MySQL数据库

确保MySQL服务已安装并运行，然后创建数据库：

```sql
CREATE DATABASE travel_planning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置环境变量

复制环境变量示例文件并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置信息：

```env
# DashScope API密钥（用于Qwen3-max）
DASHSCOPE_API_KEY=your_dashscope_api_key

# 高德地图API密钥
AMAP_API_KEY=your_amap_api_key

# MySQL数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=travel_planning
```

### 4. 启动服务

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动

## 📖 API接口文档

### 基础信息

- **基础URL**: `http://localhost:5000`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 接口列表

#### 1. 需求接收接口

**接口地址**: `POST /api/plan/input`

**功能描述**: 接收用户的旅游需求并存储到数据库

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| scene | string | 是 | 旅游场景（如：大学生独自游、家庭亲子游等） |
| days | integer | 是 | 旅游天数 |
| budget | number | 是 | 预算金额（元） |
| interest | string | 是 | 兴趣偏好（如：美食、历史、自然等） |
| demand | string | 是 | 特殊需求（如：学生证优惠、无障碍设施等） |

**请求示例**:

```json
{
    "scene": "大学生独自游",
    "days": 3,
    "budget": 1500,
    "interest": "美食",
    "demand": "学生证优惠"
}
```

**响应示例**:

```json
{
    "success": true,
    "message": "需求接收成功",
    "data": {
        "demand_id": 1,
        "scene": "大学生独自游",
        "days": 3,
        "budget": 1500,
        "interest": "美食",
        "demand": "学生证优惠"
    }
}
```

#### 2. 方案生成接口

**接口地址**: `POST /api/plan/generate`

**功能描述**: 基于用户需求调用qwen3-max生成个性化旅游方案

**请求参数**: 同需求接收接口

**请求示例**:

```json
{
    "scene": "大学生独自游",
    "days": 3,
    "budget": 1500,
    "interest": "美食",
    "demand": "学生证优惠"
}
```

**响应示例**:

```json
{
    "success": true,
    "message": "旅游方案生成成功",
    "data": {
        "plan_id": 1,
        "demand_id": 1,
        "plan": {
            "title": "北京3日美食文化之旅",
            "total_days": 3,
            "total_budget": 1500,
            "daily_plans": [
                {
                    "day": 1,
                    "date": "第一天",
                    "schedule": [
                        {
                            "time": "09:00-11:00",
                            "attraction": "天安门广场",
                            "transportation": "地铁1号线",
                            "dining": "王府井小吃街",
                            "budget": 200
                        },
                        {
                            "time": "14:00-17:00",
                            "attraction": "故宫博物院",
                            "transportation": "步行",
                            "dining": "故宫周边餐厅",
                            "budget": 300
                        }
                    ],
                    "daily_total": 500
                }
            ],
            "tips": [
                "携带学生证可享受门票优惠",
                "建议提前预约热门景点"
            ],
            "special_notes": "学生证优惠相关注意事项：大部分景点对学生有半价优惠"
        }
    }
}
```

#### 3. 动态调整接口

**接口地址**: `POST /api/plan/adjust`

**功能描述**: 根据天气或人流量情况动态调整旅游方案

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| plan_id | integer | 是 | 方案ID |
| adjust_type | string | 是 | 调整类型：weather（天气）或 crowd（人流量） |
| city | string | 否 | 城市名称（默认：北京） |

**请求示例**:

```json
{
    "plan_id": 1,
    "adjust_type": "weather",
    "city": "北京"
}
```

**响应示例**:

```json
{
    "success": true,
    "message": "方案weather调整成功",
    "data": {
        "original_plan_id": 1,
        "new_plan_id": 2,
        "adjust_type": "weather",
        "adjusted_plan": {
            "title": "北京3日美食文化之旅（雨天调整版）",
            "total_days": 3,
            "total_budget": 1500,
            "daily_plans": [
                {
                    "day": 1,
                    "date": "第一天",
                    "schedule": [
                        {
                            "time": "09:00-12:00",
                            "attraction": "国家博物馆",
                            "transportation": "地铁1号线",
                            "dining": "博物馆内餐厅",
                            "budget": 250
                        }
                    ],
                    "daily_total": 500
                }
            ],
            "tips": [
                "雨天建议选择室内景点",
                "携带雨具"
            ]
        }
    }
}
```

#### 4. 健康检查接口

**接口地址**: `GET /api/health`

**功能描述**: 检查服务运行状态

**响应示例**:

```json
{
    "success": true,
    "message": "AIGC旅游规划系统运行正常",
    "version": "1.0.0"
}
```

### 错误响应格式

```json
{
    "success": false,
    "error": "错误描述信息"
}
```

常见错误码：
- `400`: 请求参数错误
- `404`: 接口不存在
- `500`: 服务器内部错误

## 🗄️ 数据库设计

### user_demand 表（用户需求）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | INT | 主键，自增 |
| scene | VARCHAR(255) | 旅游场景 |
| days | INT | 旅游天数 |
| budget | DECIMAL(10,2) | 预算金额 |
| interest | VARCHAR(255) | 兴趣偏好 |
| demand | TEXT | 特殊需求 |
| create_time | TIMESTAMP | 创建时间 |

### travel_plan 表（旅游方案）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | INT | 主键，自增 |
| demand_id | INT | 关联的需求ID |
| plan_content | TEXT | 方案内容（JSON格式） |
| create_time | TIMESTAMP | 创建时间 |

## 🔧 配置说明

### MySQL数据库安装

1. **Windows系统**:
   - 下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - 或使用 [XAMPP](https://www.apachefriends.org/) 集成环境

2. **macOS系统**:
   ```bash
   brew install mysql
   brew services start mysql
   ```

3. **Linux系统**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql
   
   # CentOS/RHEL
   sudo yum install mysql-server
   sudo systemctl start mysqld
   ```

4. **创建数据库**:
   ```sql
   mysql -u root -p
   CREATE DATABASE travel_planning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### API密钥获取

1. **阿里云DashScope API密钥**:
   - 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
   - 注册阿里云账号并开通DashScope服务
   - 获取API密钥（API-KEY）
   - 确保账户有足够的调用额度

2. **高德地图API密钥**:
   - 访问 [高德开放平台](https://lbs.amap.com/)
   - 注册开发者账号
   - 创建应用并获取API密钥
   - 开通天气查询服务

### 环境变量配置

在项目根目录创建 `.env` 文件：

```env
DASHSCOPE_API_KEY=your_dashscope_api_key
AMAP_API_KEY=your_amap_api_key

# MySQL数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=travel_planning
```

## 🧪 测试示例

### 使用curl测试

```bash
# 1. 提交旅游需求
curl -X POST http://localhost:5000/api/plan/input \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "大学生独自游",
    "days": 3,
    "budget": 1500,
    "interest": "美食",
    "demand": "学生证优惠"
  }'

# 2. 生成旅游方案
curl -X POST http://localhost:5000/api/plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "大学生独自游",
    "days": 3,
    "budget": 1500,
    "interest": "美食",
    "demand": "学生证优惠"
  }'

# 3. 调整旅游方案
curl -X POST http://localhost:5000/api/plan/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "adjust_type": "weather",
    "city": "北京"
  }'
```

### 使用Python requests测试

```python
import requests
import json

base_url = "http://localhost:5000"

# 测试数据
test_data = {
    "scene": "大学生独自游",
    "days": 3,
    "budget": 1500,
    "interest": "美食",
    "demand": "学生证优惠"
}

# 1. 提交需求
response = requests.post(f"{base_url}/api/plan/input", json=test_data)
print("需求提交结果:", response.json())

# 2. 生成方案
response = requests.post(f"{base_url}/api/plan/generate", json=test_data)
result = response.json()
print("方案生成结果:", result)

# 3. 调整方案（如果生成成功）
if result.get("success"):
    plan_id = result["data"]["plan_id"]
    adjust_data = {
        "plan_id": plan_id,
        "adjust_type": "weather",
        "city": "北京"
    }
    response = requests.post(f"{base_url}/api/plan/adjust", json=adjust_data)
    print("方案调整结果:", response.json())
```

## 📁 项目结构

```
AIGC/
├── app.py              # Flask主应用文件
├── database.py         # 数据库操作模块
├── services.py         # AIGC服务模块
├── requirements.txt    # 项目依赖
├── .env.example       # 环境变量示例
├── .env               # 环境变量配置（需自行创建）
├── README.md          # 项目文档
└── test_api.py        # API测试脚本
```

## 🚨 注意事项

1. **API密钥安全**: 请妥善保管API密钥，不要提交到版本控制系统
2. **费用控制**: DashScope API按使用量计费，请注意控制调用频率
3. **网络环境**: 确保服务器能够访问DashScope和高德地图API
4. **数据库配置**: 确保MySQL服务正常运行，并正确配置数据库连接参数
5. **数据备份**: 定期备份MySQL数据库
6. **错误处理**: 生产环境建议增加更完善的错误处理和日志记录

## 🔄 版本更新

- v1.0.0: 初始版本，包含基础的需求接收、方案生成和动态调整功能

## 📞 技术支持

如有问题，请检查：
1. API密钥是否正确配置
2. 网络连接是否正常
3. 依赖包是否正确安装
4. 数据库文件是否有读写权限