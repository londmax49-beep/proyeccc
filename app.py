from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import os

app = Flask(__name__)
app.secret_key = "edu_nova_clave_secreta"

# ==============================
# CONEXIÓN A LA BASE DE DATOS
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "usuario.db")


def conectar_db():
    conexion = sqlite3.connect(DATABASE)
    conexion.row_factory = sqlite3.Row
    return conexion


def crear_tablas():
    conexion = conectar_db()

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            contrasena TEXT NOT NULL,
            escuela TEXT,
            grado TEXT,
            puntos INTEGER DEFAULT 0
        )
    """)

    conexion.commit()
    conexion.close()


# Crear las tablas si no existen
crear_tablas()


# ==============================
# PÁGINA PRINCIPAL
# ==============================

@app.route("/")
def inicio():
    return render_template("index.html")


# ==============================
# INICIAR SESIÓN
# ==============================

@app.route("/login", methods=["POST"])
def login():
    usuario = request.form.get("user")
    contrasena = request.form.get("pass")

    conexion = conectar_db()

    cuenta = conexion.execute(
        "SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?",
        (usuario, contrasena)
    ).fetchone()

    conexion.close()

    if cuenta:
        session["usuario"] = cuenta["usuario"]
        session["puntos"] = cuenta["puntos"]
        return redirect(url_for("dashboard"))

    return "Usuario o contraseña incorrectos."


# ==============================
# REGISTRO
# ==============================

@app.route("/registro", methods=["POST"])
def registro():
    usuario = request.form.get("user")
    contrasena = request.form.get("pass")
    escuela = request.form.get("escuela")
    grado = request.form.get("grado")

    if not usuario or not contrasena:
        return "Completa el usuario y la contraseña."

    conexion = conectar_db()

    try:
        conexion.execute("""
            INSERT INTO usuarios (usuario, contrasena, escuela, grado)
            VALUES (?, ?, ?, ?)
        """, (usuario, contrasena, escuela, grado))

        conexion.commit()

    except sqlite3.IntegrityError:
        conexion.close()
        return "Ese usuario ya existe."

    conexion.close()

    session["usuario"] = usuario
    session["puntos"] = 0

    return redirect(url_for("dashboard"))


# ==============================
# MENÚ PRINCIPAL
# ==============================

@app.route("/dashboard")
def dashboard():
    if "usuario" not in session:
        return redirect(url_for("inicio"))

    return render_template("dashboard.html")


# ==============================
# MATERIAS Y ACTIVIDADES
# ==============================

@app.route("/lengua")
def lengua():
    return render_template("lengua.html")


@app.route("/matematicas")
def matematicas():
    return render_template("matematicas.html")


@app.route("/videos")
def videos():
    return render_template("videos.html")


@app.route("/juegos")
def juegos():
    return render_template("juegos.html")


@app.route("/examen")
def examen():
    return render_template("examen.html")


# ==============================
# GUARDAR PUNTOS
# ==============================

@app.route("/api/guardar_puntos", methods=["POST"])
def guardar_puntos():
    if "usuario" not in session:
        return jsonify({"error": "Inicia sesión primero"}), 401

    datos = request.get_json(silent=True) or {}
    puntos = datos.get("puntos", 0)

    try:
        puntos = int(puntos)
        if puntos < 0:
            return jsonify({"error": "Puntos no válidos"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "Puntos no válidos"}), 400

    conexion = conectar_db()

    conexion.execute(
        "UPDATE usuarios SET puntos = ? WHERE usuario = ?",
        (puntos, session["usuario"])
    )

    conexion.commit()
    conexion.close()

    session["puntos"] = puntos

    return jsonify({"mensaje": "Puntos guardados", "puntos": puntos})


# ==============================
# RANKING
# ==============================

@app.route("/api/ranking")
def ranking():
    conexion = conectar_db()

    usuarios = conexion.execute("""
        SELECT usuario, puntos
        FROM usuarios
        ORDER BY puntos DESC
        LIMIT 10
    """).fetchall()

    conexion.close()

    return jsonify([
        {"usuario": u["usuario"], "puntos": u["puntos"]}
        for u in usuarios
    ])


# ==============================
# CERRAR SESIÓN
# ==============================

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("inicio"))


# ==============================
# EJECUTAR APLICACIÓN
# ==============================

if __name__ == "__main__":
    app.run(debug=True)