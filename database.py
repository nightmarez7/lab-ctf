from contextlib import contextmanager
import sqlite3
import random

@contextmanager
def connect():
    c = sqlite3.connect("dataBank.db")

    c.row_factory = sqlite3.Row

    try:
        yield c
        c.commit()
    finally:
        c.close()

def create_tables():
    with connect() as c:    # abre a conexão
        cursor = c.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            senha TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
        )
        """)

def seed_usuarios():
    with connect() as c:
        cursor = c.cursor()

        cursor.execute("SELECT COUNT(*) FROM usuarios")
        if cursor.fetchone()[0] > 0:
            return  # já tem gente, não semeia de novo

        nomes = [
            "Marina Albuquerque", "Rafael Tomita", "Luciana Prado",
            "Thiago Nascimento", "Beatriz Furlan", "Diego Marques",
            "Helena Costa Lima", "Bruno Salgado", "Carla Menezes",
            "Otávio Ramos"
        ]

        random.shuffle(nomes)  # embaralha a ordem de inserção

        # o admin nunca fica na primeira linha (id = 1), então um
        # payload ingênuo (' OR 1=1 -- ) sempre cai num usuário comum.
        # Pra virar admin, o jogador precisa mirar a coluna: ' OR role='admin' --
        indice_admin = random.randint(1, len(nomes) - 1)

        for i, nome in enumerate(nomes):
            email = nome.lower().replace(" ", ".") + "@banco.com"
            senha = "senha" + str(random.randint(1000, 9999))
            role = "admin" if i == indice_admin else "user"
            cursor.execute(
                f"INSERT INTO usuarios (nome, email, senha, role) VALUES ('{nome}', '{email}', '{senha}', '{role}')"
            )
