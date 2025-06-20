# 使用官方Python基础镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 复制当前目录所有内容到容器内
COPY . /app

# 安装依赖
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# 暴露端口
EXPOSE 5000

# 启动命令（用模块方式，保证包内导入正常）
CMD ["python", "-m", "app"] 