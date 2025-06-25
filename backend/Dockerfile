# 使用官方Python基础镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 只复制依赖文件，便于热重载时挂载代码
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# 暴露端口
EXPOSE 5000

# 用flask run启动，支持热重载
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"] 