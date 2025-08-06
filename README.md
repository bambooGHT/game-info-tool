# 轻烟阁API服务

基于FastAPI的游戏搜索和图片代理服务。

## 快速部署

### Docker部署
```bash
# 构建并启动
docker build -t qyg-api .
docker-compose up -d

# 验证
curl http://localhost:8002/health
```

### 本地部署
```bash
# 安装依赖
uv sync

# 启动服务
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 配置

创建 `.env` 文件：
```bash
LOG_LEVEL=INFO
PROXY=
```

## API接口

- **健康检查**: `GET /health`
- **游戏搜索**: `GET /v0/search?q={query}&site={site}`
- **图片代理**: `GET /v0/image?url={image_url}`
- **API文档**: `http://localhost:8002/docs`

## 管理命令

```bash
# 查看日志
docker-compose logs -f app

# 重启服务
docker-compose restart app

# 更新部署
docker-compose down
docker build -t qyg-api .
docker-compose up -d
```

## 端口

- 容器内部: 8000
- 主机映射: 8002
