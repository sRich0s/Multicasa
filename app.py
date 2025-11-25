from pathlib import Path
import os
from flask import Flask, render_template, request, jsonify, make_response
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


class Image(db.Model):
    # Tabla creada inicialmente por SQLAlchemy: image
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.LargeBinary, nullable=False)


class ViviendaImage(db.Model):
    # Tabla creada inicialmente por SQLAlchemy: vivienda_image
    imageID = db.Column(db.Integer, db.ForeignKey('image.id'), primary_key=True)
    viviendaID = db.Column(db.Integer, db.ForeignKey('vivienda.id'), primary_key=True)

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


@app.route('/mapa-viviendas/<int:vivienda_id>/pdf')
def mapa_vivienda_pdf(vivienda_id):
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from io import BytesIO

    v = Vivienda.query.get_or_404(vivienda_id)
    rels = ViviendaImage.query.filter_by(viviendaID=vivienda_id).all()

    images = []
    for r in rels:
        img = Image.query.get(r.imageID)
        if img:
            images.append(img)

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # ===== Portada =====
    # Banda superior solo como fondo de color, sin texto que pueda quedar detrás de la caja gris
    c.setFillColorRGB(0.0, 0.2, 0.4)  # azul oscuro
    c.rect(0, height - 70, width, 70, stroke=0, fill=1)

    # Título general, separado claramente de la caja
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 90, "Ficha de Vivienda")

    # Bloque de datos destacados (título, precio, tipo, estado) con padding interno claro
    box_y = height - 210
    box_h = 100
    c.setFillColorRGB(0.95, 0.95, 0.95)
    c.roundRect(40, box_y, width - 80, box_h, 8, stroke=0, fill=1)

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    text_price = c.beginText()
    text_price.setTextOrigin(50, box_y + box_h - 24)
    text_price.textLine(f"Título: {v.titulo}")
    text_price.textLine(f"Precio: ${v.precio:,.2f}")
    text_price.textLine(f"Tipo: {v.tipo.upper()}")
    text_price.textLine(f"Estado: {v.estado.upper()}")
    c.drawText(text_price)

    # Bloque de detalles (habitaciones, baños, área, coords) bien separado de la caja
    details_y = box_y - 50
    c.setFont("Helvetica", 10)
    detalles = [
        f"Habitaciones: {v.habitaciones}",
        f"Baños: {v.banos}",
        f"Área: {v.area} m²",
        f"Ubicación: lat {v.lat:.6f}, lng {v.lng:.6f}",
        f"Fecha de creación: {v.fechaCreacion}",
    ]
    y = details_y
    for d in detalles:
        c.drawString(50, y, d)
        y -= 14

    # Recuadro para descripción (con más margen para evitar solaparse)
    desc_top = y - 10
    desc_bottom = 100
    c.setFillColorRGB(0.98, 0.98, 0.98)
    c.roundRect(40, desc_bottom, width - 80, desc_top - desc_bottom, 8, stroke=0, fill=1)

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, desc_top - 18, "Descripción")

    text_obj = c.beginText()
    text_obj.setTextOrigin(50, desc_top - 32)
    text_obj.setFont("Helvetica", 10)

    # Ajustar descripción en varias líneas
    max_chars = 90
    for raw_line in v.descripcion.split("\n"):
        line = raw_line.strip()
        while len(line) > max_chars:
            text_obj.textLine(line[:max_chars])
            line = line[max_chars:]
        if line:
            text_obj.textLine(line)
        else:
            text_obj.textLine("")
    c.drawText(text_obj)

    # Pie de página
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    c.drawRightString(width - 40, 40, "MultiCasa - Reporte generado automáticamente")

    # ===== Página(s) de imágenes =====
    if images:
        c.showPage()
        c.setFillColorRGB(0.0, 0.2, 0.4)
        c.rect(0, height - 60, width, 60, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 40, "Imágenes de la vivienda")

        # Configuración del grid de imágenes
        margin_x = 50
        margin_y = 80
        max_w = (width - 2 * margin_x)
        max_h = (height - 2 * margin_y)

        # Pondremos 2 imágenes por página (una arriba, otra abajo)
        slot_h = max_h / 2 - 10
        current_index = 0

        while current_index < len(images):
            for i in range(2):
                if current_index >= len(images):
                    break
                img = images[current_index]
                # Cada slot: usar una altura cómoda, respetando proporciones
                y_slot_top = height - margin_y - i * (slot_h + 10)
                y_img = y_slot_top - slot_h

                temp_path = Path(f"temp_image_{vivienda_id}_{img.id}.pdf_img")
                with open(temp_path, "wb") as f:
                    f.write(img.data)
                try:
                    c.drawImage(
                        str(temp_path),
                        margin_x,
                        y_img,
                        width=max_w,
                        height=slot_h,
                        preserveAspectRatio=True,
                        anchor='sw',
                        mask='auto'
                    )
                except Exception:
                    c.setFillColor(colors.red)
                    c.setFont("Helvetica", 10)
                    c.drawString(margin_x, y_img + slot_h / 2, "[No se pudo renderizar esta imagen]")
                    c.setFillColor(colors.black)
                try:
                    temp_path.unlink()
                except Exception:
                    pass

                current_index += 1

            if current_index < len(images):
                c.showPage()
                # Encabezado en páginas siguientes
                c.setFillColorRGB(0.0, 0.2, 0.4)
                c.rect(0, height - 40, width, 40, stroke=0, fill=1)
                c.setFillColor(colors.white)
                c.setFont("Helvetica-Bold", 14)
                c.drawString(50, height - 25, "Imágenes de la vivienda (cont.)")

    c.save()
    pdf_value = buffer.getvalue()
    buffer.close()

    response = make_response(pdf_value)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = f"attachment; filename=vivienda_{v.id}.pdf"
    return response


@app.route('/api/viviendas/<int:vivienda_id>/imagenes')
def api_vivienda_imagenes(vivienda_id):
    Vivienda.query.get_or_404(vivienda_id)
    rels = ViviendaImage.query.filter_by(viviendaID=vivienda_id).all()
    images = []
    for r in rels:
        img = Image.query.get(r.imageID)
        if img:
            images.append(img.id)
    return jsonify({'ids': images})


@app.route('/api/imagenes/<int:image_id>')
def api_imagen(image_id):
    from flask import send_file
    from io import BytesIO
    img = Image.query.get_or_404(image_id)
    # Asumimos imagen tipo JPEG/PNG; si quieres precisión, guarda también mimetype
    return send_file(BytesIO(img.data), mimetype='image/jpeg')

# =============================================
# API VIVIENDAS
# =============================================
@app.route('/api/viviendas', methods=['GET','POST'])
def api_viviendas():
    if request.method == 'GET':
        viviendas = Vivienda.query.order_by(Vivienda.id.desc()).all()
        return jsonify([v.to_dict() for v in viviendas])

    # POST - crear vivienda (JSON o multipart con imágenes)
    content_type = request.content_type or ''

    if content_type.startswith('application/json'):
        data = request.json or {}
        v = Vivienda(**data)
        db.session.add(v)
        db.session.commit()
        return jsonify(v.to_dict()), 201

    if content_type.startswith('multipart/form-data'):
        form = request.form
        try:
            v = Vivienda(
                titulo=form.get('titulo',''),
                precio=float(form.get('precio', 0)),
                lat=float(form.get('lat', 0)),
                lng=float(form.get('lng', 0)),
                habitaciones=int(form.get('habitaciones', 0)),
                banos=int(form.get('banos', 0)),
                area=int(form.get('area', 0)),
                tipo=form.get('tipo',''),
                estado=form.get('estado',''),
                descripcion=form.get('descripcion','')
            )
        except ValueError:
            return jsonify({'error': 'Datos numéricos inválidos'}), 400

        db.session.add(v)
        db.session.flush()  # obtener id antes del commit

        # Guardar imágenes (si hay)
        files = request.files.getlist('imagenes')
        for f in files:
            if not f or f.filename == '':
                continue
            img = Image(data=f.read())
            db.session.add(img)
            db.session.flush()
            vi = ViviendaImage(imageID=img.id, viviendaID=v.id)
            db.session.add(vi)

        db.session.commit()
        return jsonify(v.to_dict()), 201

    return jsonify({'error': 'Content-Type no soportado'}), 400

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
