from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS # CORS：解决前后端分离时的跨域问题
from auth.controller import auth_bp

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'your-secret-key'  # JWT 用
app.register_blueprint(auth_bp, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True)
