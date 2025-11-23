from pathlib import Path
import os

from flask import Flask, render_template

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/admin-login')
def admin_login():
    return render_template('admin-login.html')

@app.route('/admin-panel')
def admin_panel():
    return render_template('admin-panel.html')

if __name__ == '__main__':
    app.run(debug=True)
