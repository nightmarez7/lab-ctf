from flask import Flask, request, jsonify, render_template, session
from database import connect, create_tables, seed_usuarios
import sqlite3

app = Flask(__name__)
app.secret_key = "f497c1fdfd087df7a18a4151db269e272260bbc9f10b220cd9e46e1460e24060"

create_tables()
seed_usuarios()

# ---- dados sensíveis do painel (só admin pode ler) ----
TRANSACOES = [
    {"id": 1,  "tipo": "Pix recebido", "nome": "Marina Albuquerque",     "valor": 2450,   "status": "Concluída", "quando": "Hoje, 10:42"},
    {"id": 2,  "tipo": "TED enviada",  "nome": "Construtora Vale Verde",  "valor": -38900, "status": "Pendente",  "quando": "Hoje, 10:18", "motivo": "Valor acima do limite diário da conta"},
    {"id": 3,  "tipo": "Boleto",       "nome": "Padaria Estrela do Sul",  "valor": -612.4, "status": "Concluída", "quando": "Hoje, 09:57"},
    {"id": 4,  "tipo": "Pix enviado",  "nome": "Rafael Tomita",           "valor": -15000, "status": "Suspeita",  "quando": "Hoje, 09:31", "motivo": "Valor 6 vezes acima da média do cliente"},
    {"id": 5,  "tipo": "Cartão",       "nome": "Livraria Trilha",         "valor": -189.9, "status": "Concluída", "quando": "Hoje, 09:12"},
    {"id": 6,  "tipo": "Pix recebido", "nome": "Clínica Sorriso Bom",     "valor": 7320,   "status": "Concluída", "quando": "Hoje, 08:40"},
    {"id": 7,  "tipo": "TED enviada",  "nome": "Luciana Prado",           "valor": -22000, "status": "Pendente",  "quando": "Hoje, 08:05", "motivo": "Conta de destino cadastrada há menos de 24 h"},
    {"id": 8,  "tipo": "Pix enviado",  "nome": "Distribuidora Oeste",     "valor": -4870,  "status": "Concluída", "quando": "Ontem, 18:22"},
    {"id": 9,  "tipo": "Boleto",       "nome": "Imobiliária Central",     "valor": -3150,  "status": "Concluída", "quando": "Ontem, 16:10"},
    {"id": 10, "tipo": "Pix recebido", "nome": "Thiago Nascimento",       "valor": 980,    "status": "Concluída", "quando": "Ontem, 14:37"},
    {"id": 11, "tipo": "Cartão",       "nome": "Viagens Horizonte",       "valor": -6240,  "status": "Suspeita",  "quando": "Ontem, 11:03", "motivo": "Compra internacional fora do padrão"},
    {"id": 12, "tipo": "TED recebida", "nome": "Agro Campina S/A",        "valor": 64500,  "status": "Concluída", "quando": "Ontem, 09:48"}
]

CLIENTES = [
    {"id": 1,  "nome": "Marina Albuquerque",     "cidade": "Campinas",              "saldo": 48210.55, "status": "Ativo",      "desde": 2019},
    {"id": 2,  "nome": "Rafael Tomita",          "cidade": "Sorocaba",              "saldo": 132480,   "status": "Ativo",      "desde": 2021},
    {"id": 3,  "nome": "Luciana Prado",          "cidade": "Piracicaba",            "saldo": 9315.2,   "status": "Ativo",      "desde": 2023},
    {"id": 4,  "nome": "Clínica Sorriso Bom",    "cidade": "Americana",             "saldo": 210940.1, "status": "Ativo",      "desde": 2018},
    {"id": 5,  "nome": "Thiago Nascimento",      "cidade": "Rio Claro",             "saldo": 1204.77,  "status": "Em análise", "desde": 2026},
    {"id": 6,  "nome": "Construtora Vale Verde", "cidade": "Sorocaba",              "saldo": 587300,   "status": "Ativo",      "desde": 2016},
    {"id": 7,  "nome": "Padaria Estrela do Sul", "cidade": "Santa Bárbara d'Oeste", "saldo": 18902.3,  "status": "Ativo",      "desde": 2020},
    {"id": 8,  "nome": "Beatriz Furlan",         "cidade": "São Paulo",             "saldo": 73660,    "status": "Ativo",      "desde": 2022},
    {"id": 9,  "nome": "Agro Campina S/A",       "cidade": "Ribeirão Preto",        "saldo": 2941010,  "status": "Ativo",      "desde": 2015},
    {"id": 10, "nome": "Diego Marques",          "cidade": "Curitiba",              "saldo": 0,        "status": "Bloqueado",  "desde": 2024},
    {"id": 11, "nome": "Helena Costa Lima",      "cidade": "Belo Horizonte",        "saldo": 26480.9,  "status": "Em análise", "desde": 2026},
    {"id": 12, "nome": "Livraria Trilha",        "cidade": "Campinas",              "saldo": 11735.4,  "status": "Ativo",      "desde": 2021}
]


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/admin", methods=["GET"])
def admin():
    return render_template("admin.html")

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("email")
    password = request.form.get("senha")

    with connect() as c:
        cursor = c.cursor()
        cursor.execute(f"SELECT * FROM usuarios WHERE email = '{username}' AND senha = '{password}'")
        usuario = cursor.fetchone()

    if usuario:
        session["logado"] = True
        session["email"] = usuario["email"]
        session["role"] = usuario["role"]   # guardado só no servidor
        return jsonify({"ok": True})         # não expõe o papel na resposta
    return jsonify({"ok": False})

@app.route("/cadastro", methods=["POST"])
def cadastro():
    nome = request.form.get("nome")
    email = request.form.get("email")
    senha = request.form.get("senha")

    with connect() as c:
        cursor = c.cursor()
        cursor.execute(f"INSERT INTO usuarios (nome, email, senha, role) VALUES ('{nome}', '{email}', '{senha}', 'user')")

    return jsonify({"ok": True})

@app.route("/api/painel")
def api_painel():
    if session.get("role") != "admin":
        return jsonify({"erro": "sem permissão"}), 403
    return jsonify({"transacoes": TRANSACOES, "clientes": CLIENTES})

@app.route("/sessao")
def sessao():
    return jsonify({
        "logado": session.get("logado", False)
    })

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})

app.run(debug=True)
