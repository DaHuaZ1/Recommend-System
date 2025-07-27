# 使用官方Python基础镜像
FROM python:3.10

# 设置时区为澳洲东部时间
ENV TZ=Australia/Sydney
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 设置工作目录
WORKDIR /app

# 先只复制依赖文件，利用 Docker 缓存
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# 再复制其它代码
COPY . /app

# 暴露端口
EXPOSE 5000

ENV FLASK_DEBUG=1
CMD ["flask", "--app", "app", "run", "--host=0.0.0.0", "--port=5000"] 