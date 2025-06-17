from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from auth.dao import create_user, find_user_by_email

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if find_user_by_email(email):
        return jsonify({'error': 'Email already exists'}), 400

    hashed = generate_password_hash(password)
    create_user(username, email, hashed)

    return jsonify({'message': 'User registered successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = find_user_by_email(email)
    if not user or not check_password_hash(user[3], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user[0],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token, 'user': {'id': user[0], 'username': user[1]}})
