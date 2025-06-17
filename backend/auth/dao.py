import sqlite3


def get_db():
    conn = sqlite3.connect('users.db')
    return conn


def create_user(username, email, password_hash):
    conn = get_db()
    c = conn.cursor()
    c.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', (username, email, password_hash))
    conn.commit()
    conn.close()


def find_user_by_email(email):
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()
    return user
