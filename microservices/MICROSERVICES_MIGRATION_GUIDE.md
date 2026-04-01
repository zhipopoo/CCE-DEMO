# 微服务改造指南

## 架构概览

本次微服务改造将单体应用拆分为以下服务：

### 整体架构图

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (React)                         │
│                        Port: 80                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                       API Gateway                             │
│                (Spring Cloud Gateway)                         │
│                       Port: 8080                              │
│                                                               │
│  路由规则:                                                    │
│  • /api/users/** → user-service                              │
│  • /api/files/** → file-service                              │
└───────────────┬──────────────────────┬───────────────────────┘
                │                      │
                ▼                      ▼
┌────────────────────────┐  ┌────────────────────────┐
│    User Service        │  │    File Service        │
│    (Spring Boot)       │  │    (Spring Boot)       │
│    Port: 8081          │  │    Port: 8082          │
│                        │  │                        │
│  功能: 用户管理 CRUD   │  │  功能: 文件上传/管理   │
└───────────┬────────────┘  └───────────┬────────────┘
            │                           │
            └───────────┬───────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │       MySQL           │
            │     Port: 3306        │
            │                       │
            │  存储: 业务数据       │
            └───────────────────────┘
```

### 服务发现架构（独立组件）

```
┌──────────────────────────────────────────────────────────────┐
│              Service Discovery (Eureka Server)                │
│                        Port: 8761                             │
│                                                               │
│  功能: 服务注册与发现中心                                    │
│                                                               │
│  已注册的服务列表:                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 服务名称          │ 实例地址           │ 状态        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ api-gateway       │ 192.168.1.10:8080  │ UP          │   │
│  │ user-service      │ 192.168.1.11:8081  │ UP          │   │
│  │ file-service      │ 192.168.1.12:8082  │ UP          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    注册/心跳        注册/心跳        注册/心跳
          │               │               │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │   API     │   │   User    │   │   File    │
    │  Gateway  │   │  Service  │   │  Service  │
    └───────────┘   └───────────┘   └───────────┘
```

### 服务调用流程

```
1. 服务启动阶段:
   User Service 启动 → 向 Eureka 注册 (服务名: user-service, 地址: 192.168.1.11:8081)
   File Service 启动 → 向 Eureka 注册 (服务名: file-service, 地址: 192.168.1.12:8082)
   API Gateway 启动 → 向 Eureka 注册 (服务名: api-gateway, 地址: 192.168.1.10:8080)

2. 服务调用阶段:
   Frontend 请求: GET /api/users
   ↓
   API Gateway 接收请求
   ↓
   API Gateway 查询 Eureka: "user-service 在哪里？"
   ↓
   Eureka 返回: "user-service 在 192.168.1.11:8081"
   ↓
   API Gateway 转发请求到: http://192.168.1.11:8081/api/users
   ↓
   User Service 处理请求并返回结果
```

### 数据流向

```
业务数据流:
Frontend → API Gateway → User/File Service → MySQL

服务发现流:
各服务 ←→ Service Discovery (Eureka)
```

### 关键说明

- **Service Discovery (Eureka)**: 服务注册中心，管理服务地址，**不处理业务数据**
- **MySQL**: 业务数据库，存储用户信息、文件元数据等，**不参与服务发现**
- **API Gateway**: 统一入口，通过 Eureka 发现服务并路由请求
- **User/File Service**: 业务服务，向 Eureka 注册，从 MySQL 读写数据

## 已创建的服务

### 1. Service Discovery (Eureka Server)
- **位置**: `microservices/service-discovery/`
- **端口**: 8761
- **功能**: 服务注册与发现
- **状态**: ✅ 已完成

### 2. API Gateway
- **位置**: `microservices/api-gateway/`
- **端口**: 8080
- **功能**: 统一入口、路由、负载均衡
- **路由配置**:
  - `/api/users/**` → user-service
  - `/api/files/**` → file-service
- **状态**: ✅ 已完成

### 3. User Service
- **位置**: `microservices/user-service/`
- **端口**: 8081
- **功能**: 用户管理 CRUD 操作
- **状态**: 🔄 进行中（需要迁移代码）

### 4. File Service
- **位置**: `microservices/file-service/`
- **端口**: 8082
- **功能**: 文件上传、下载、管理
- **状态**: ⏳ 待创建

## 下一步操作

### 1. 完成 User Service 代码迁移

需要从 `backend/src/main/java/com/example/ccedemo/` 迁移以下文件：

```bash
# 迁移实体类
cp backend/src/main/java/com/example/ccedemo/entity/User.java \
   microservices/user-service/src/main/java/com/example/ccedemo/userservice/entity/

# 迁移 Repository
cp backend/src/main/java/com/example/ccedemo/repository/UserRepository.java \
   microservices/user-service/src/main/java/com/example/ccedemo/userservice/repository/

# 迁移 Service
cp backend/src/main/java/com/example/ccedemo/service/UserService.java \
   microservices/user-service/src/main/java/com/example/ccedemo/userservice/service/

# 迁移 Controller
cp backend/src/main/java/com/example/ccedemo/controller/UserController.java \
   microservices/user-service/src/main/java/com/example/ccedemo/userservice/controller/

# 迁移 CORS 配置
cp backend/src/main/java/com/example/ccedemo/config/CorsConfig.java \
   microservices/user-service/src/main/java/com/example/ccedemo/userservice/config/
```

创建主应用类：
```java
// microservices/user-service/src/main/java/com/example/ccedemo/userservice/UserServiceApplication.java
package com.example.ccedemo.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

创建配置文件：
```yaml
# microservices/user-service/src/main/resources/application.yml
server:
  port: 8081

spring:
  application:
    name: user-service
  datasource:
    url: jdbc:mysql://${DB_HOST:mysql}:${DB_PORT:3306}/${DB_NAME:ccedemo}?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true

eureka:
  client:
    service-url:
      defaultZone: http://service-discovery:8761/eureka/

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

### 2. 创建 File Service

参考 User Service 的结构，创建 File Service，迁移文件管理相关代码。

### 3. 创建 Kubernetes 配置

为每个微服务创建 Kubernetes 部署配置：

```yaml
# k8s/microservices/service-discovery-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-discovery
  namespace: cce-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: service-discovery
  template:
    metadata:
      labels:
        app: service-discovery
    spec:
      containers:
      - name: service-discovery
        image: <swr-endpoint>/<namespace>/service-discovery:latest
        ports:
        - containerPort: 8761
---
apiVersion: v1
kind: Service
metadata:
  name: service-discovery
  namespace: cce-demo
spec:
  type: ClusterIP
  ports:
  - port: 8761
    targetPort: 8761
  selector:
    app: service-discovery
```

### 4. 更新 Helm Chart

创建新的 Helm chart 支持微服务部署：

```bash
mkdir -p k8s/microservices-chart/templates
```

### 5. 更新 Jenkinsfile

修改 CI/CD 流水线以支持微服务构建和部署。

## 技术栈

- **Spring Boot 3.2.0**
- **Spring Cloud 2023.0.0**
- **Spring Cloud Netflix Eureka** - 服务发现
- **Spring Cloud Gateway** - API 网关
- **MySQL 8.0** - 数据库
- **Docker** - 容器化
- **Kubernetes** - 容器编排
- **Helm** - 包管理

## 优势

1. **独立部署**: 每个服务可以独立部署和扩展
2. **技术异构**: 不同服务可以使用不同的技术栈
3. **故障隔离**: 单个服务故障不会影响其他服务
4. **团队协作**: 不同团队可以独立开发不同服务
5. **可扩展性**: 可以根据需求独立扩展每个服务

## 注意事项

1. **服务间通信**: 使用 REST API 或消息队列
2. **数据一致性**: 每个服务应该有自己的数据库
3. **监控**: 需要分布式追踪和监控
4. **配置管理**: 使用配置中心管理配置
5. **安全**: 服务间通信需要认证和授权

## 后续改进

1. 添加配置中心 (Spring Cloud Config)
2. 添加分布式追踪 (Sleuth + Zipkin)
3. 添加熔断器 (Resilience4j)
4. 添加消息队列 (RabbitMQ/Kafka)
5. 添加 API 文档 (Swagger/OpenAPI)
6. 添加分布式日志 (ELK Stack)
