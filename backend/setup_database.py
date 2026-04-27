"""
Database initialization script
Run this script to create the database tables
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = "localhost"
DB_PORT = "5433"
DB_USER = "postgres"
DB_PASSWORD = os.getenv("DB_PASSWORD", "Utkarsh@2005")
DB_NAME = "inventory_db"

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to default postgres database
        print(f"Connecting to PostgreSQL at {DB_HOST}:{DB_PORT}...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"[OK] Database '{DB_NAME}' created successfully!")
        else:
            print(f"[INFO] Database '{DB_NAME}' already exists")

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[ERROR] Failed to create database: {e}")
        return False

if __name__ == "__main__":
    print("Setting up database...")
    create_database()
