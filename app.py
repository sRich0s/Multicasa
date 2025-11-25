from pathlib import Path
import os
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')

# =============================================
# CONFIGURACIÓN BASE DE DATOS (SQLite + ORM)
# =============================================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///multicasa.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# =============================================
# MODELOS
# =============================================
class Vivienda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    habitaciones = db.Column(db.Integer, nullable=False)
    banos = db.Column(db.Integer, nullable=False)
    area = db.Column(db.Integer, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    fechaCreacion = db.Column(db.String(20), default=lambda: datetime.now().strftime('%d/%m/%Y'))

    def to_dict(self):
        return {k: getattr(self, k) for k in ['id','titulo','precio','lat','lng','habitaciones','banos','area','tipo','estado','descripcion','fechaCreacion']}

class Noticia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.String(20), default=lambda: datetime.now().strftime('%d/%m/%Y'))
    def to_dict(self):
        return {k: getattr(self, k) for k in ['id','titulo','contenido','fecha']}

class Contacto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    correo = db.Column(db.String(120), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.String(20), default=lambda: datetime.now().strftime('%d/%m/%Y'))
    def to_dict(self):
        return {k: getattr(self, k) for k in ['id','nombre','correo','mensaje','fecha']}

class Transaccion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    viviendasId = db.Column(db.Integer, db.ForeignKey('vivienda.id'), nullable=False)
    viviendasTitulo = db.Column(db.String(200), nullable=False)
    tipoAnterior = db.Column(db.String(50), nullable=False)
    tipoNuevo = db.Column(db.String(50), nullable=False)
    fecha = db.Column(db.String(20), default=lambda: datetime.now().strftime('%d/%m/%Y'))
    def to_dict(self):
        return {k: getattr(self, k) for k in ['id','viviendasId','viviendasTitulo','tipoAnterior','tipoNuevo','fecha']}

# Crear tablas si no existen
with app.app_context():
    db.create_all()

# =============================================
# PÁGINAS
# =============================================
@app.route('/')
def index():
    return render_template('main.html')

@app.route('/admin-login')
def admin_login():
    return render_template('admin-login.html')

@app.route('/admin-panel')
def admin_panel():
    return render_template('admin-panel.html')

@app.route('/mapa-viviendas')
def mapa_viviendas():
    return render_template('mapa-viviendas.html')

@app.route('/compra')
def compra():
    return render_template('compra.html')

@app.route('/company')
def company():
    return render_template('main.html')

@app.route('/services')
def services():
    return render_template('main.html')

@app.route('/requirements')
def requirements():
    return render_template('main.html')

@app.route('/contacts')
def contacts():
    return render_template('main.html')

@app.route('/construir')
def construir():
    return render_template('construir.html')

@app.route('/venta')
def venta():
    return render_template('venta.html')

@app.route('/mudanzas')
def mudanzas():
    return render_template('mudanzas.html')

@app.route('/seguros')
def seguros():
    return render_template('seguros.html')    

# =============================================
# API VIVIENDAS
# =============================================
@app.route('/api/viviendas', methods=['GET','POST'])
def api_viviendas():
    if request.method == 'GET':
        viviendas = Vivienda.query.order_by(Vivienda.id.desc()).all()
        return jsonify([v.to_dict() for v in viviendas])
    data = request.json
    v = Vivienda(**data)
    db.session.add(v)
    db.session.commit()
    return jsonify(v.to_dict()), 201

@app.route('/api/viviendas/<int:vivienda_id>', methods=['GET','PUT','DELETE'])
def api_vivienda_detail(vivienda_id):
    v = Vivienda.query.get_or_404(vivienda_id)
    if request.method == 'GET':
        return jsonify(v.to_dict())
    if request.method == 'PUT':
        data = request.json
        for k, val in data.items():
            if hasattr(v, k):
                setattr(v, k, val)
        db.session.commit()
        return jsonify(v.to_dict())
    db.session.delete(v)
    db.session.commit()
    return jsonify({'status':'deleted'})

# =============================================
# API NOTICIAS
# =============================================
@app.route('/api/noticias', methods=['GET','POST'])
def api_noticias():
    if request.method == 'GET':
        noticias = Noticia.query.order_by(Noticia.id.desc()).all()
        return jsonify([n.to_dict() for n in noticias])
    data = request.json
    n = Noticia(**data)
    db.session.add(n)
    db.session.commit()
    return jsonify(n.to_dict()), 201

@app.route('/api/noticias/<int:noticia_id>', methods=['DELETE'])
def api_noticia_delete(noticia_id):
    n = Noticia.query.get_or_404(noticia_id)
    db.session.delete(n)
    db.session.commit()
    return jsonify({'status':'deleted'})

# =============================================
# API CONTACTOS
# =============================================
@app.route('/api/contactos', methods=['GET','POST'])
def api_contactos():
    if request.method == 'GET':
        contactos = Contacto.query.order_by(Contacto.id.desc()).all()
        return jsonify([c.to_dict() for c in contactos])
    data = request.json
    c = Contacto(**data)
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201

@app.route('/api/contactos/<int:contacto_id>', methods=['DELETE'])
def api_contacto_delete(contacto_id):
    c = Contacto.query.get_or_404(contacto_id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'status':'deleted'})

# =============================================
# API TRANSACCIONES
# =============================================
@app.route('/api/transacciones', methods=['GET','POST'])
def api_transacciones():
    if request.method == 'GET':
        transacciones = Transaccion.query.order_by(Transaccion.id.desc()).all()
        return jsonify([t.to_dict() for t in transacciones])
    data = request.json
    vivienda = Vivienda.query.get_or_404(data.get('viviendasId'))
    tipoAnterior = vivienda.tipo
    vivienda.tipo = data.get('tipoNuevo', vivienda.tipo)
    db.session.add(vivienda)
    trans = Transaccion(
        viviendasId=vivienda.id,
        viviendasTitulo=vivienda.titulo,
        tipoAnterior=tipoAnterior,
        tipoNuevo=vivienda.tipo
    )
    db.session.add(trans)
    db.session.commit()
    return jsonify(trans.to_dict()), 201

if __name__ == '__main__':
    app.run(debug=True)
