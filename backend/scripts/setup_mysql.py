"""Run only after approval: provision local databases and a scoped app user.

Administrator credentials are read by mysql.exe from its existing login path.
No passwords are put in command arguments or printed. Existing user passwords
and existing backend .env files are never overwritten.
"""
import argparse
from getpass import getpass
import os
from pathlib import Path
import secrets
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--login-path")
    source.add_argument("--admin-user", help="Prompt locally for the administrator password")
    args = parser.parse_args()
    admin_connection = None
    if args.admin_user:
        import MySQLdb
        try:
            admin_connection = MySQLdb.connect(host="127.0.0.1", port=3306, user=args.admin_user,
                                               passwd=getpass("MySQL administrator password: "), charset="utf8mb4")
            admin_connection.autocommit(True)
        except Exception:
            raise SystemExit("Administrator connection failed. Verify your username/password locally. No credentials printed.") from None

    def query(sql):
        if admin_connection:
            try:
                with admin_connection.cursor() as cursor:
                    for statement in sql.split(";"):
                        if statement.strip():
                            cursor.execute(statement)
                    rows = cursor.fetchall() if cursor.description else []
                    return "\n".join(str(row[0]) for row in rows)
            except Exception:
                raise SystemExit("MySQL administration failed. Check privileges. No credentials printed.") from None
        result = subprocess.run(
            ["mysql", f"--login-path={args.login_path}", "--connect-timeout=5", "--batch", "--skip-column-names"],
            input=sql, text=True, capture_output=True, timeout=20,
        )
        if result.returncode:
            # MySQL errors might echo SQL containing credentials; don't print them.
            raise SystemExit("MySQL administration failed. Check login-path access and privileges. No credentials were printed.")
        return result.stdout.strip()

    query("SELECT 1;")
    existing = query("SELECT COUNT(*) FROM mysql.user WHERE User='forma_app' AND Host='localhost';")
    env_file = ROOT / ".env"
    password = None
    if existing == "0" and env_file.exists():
        raise SystemExit("backend/.env already exists but forma_app is missing. Review local credentials before provisioning; nothing changed.")
    if existing == "0":
        password = secrets.token_urlsafe(40)
    elif not env_file.exists() and not os.environ.get("DB_PASSWORD"):
        raise SystemExit("forma_app already exists. Set its existing password in backend/.env; no password was changed.")
    sql = "CREATE DATABASE IF NOT EXISTS forma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n"
    sql += "CREATE DATABASE IF NOT EXISTS test_forma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n"
    if password:
        sql += f"CREATE USER 'forma_app'@'localhost' IDENTIFIED BY '{password}';\n"
    for database in ["forma", "test\\_forma"]:
        sql += f"GRANT ALL PRIVILEGES ON `{database}`.* TO 'forma_app'@'localhost';\n"
    query(sql)
    if password and not env_file.exists():
        with env_file.open("x", encoding="utf-8") as stream:
            stream.write(f"DB_NAME=forma\nDB_USER=forma_app\nDB_PASSWORD={password}\nDB_HOST=127.0.0.1\nDB_PORT=3306\n")
        print("Database and application user ready. Generated credentials saved only in backend/.env.")
    else:
        print("Databases and user ready; existing credentials preserved.")


if __name__ == "__main__":
    main()
