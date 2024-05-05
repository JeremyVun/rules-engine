import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function initDb() {
	const db = await open({
		filename: './database.db',
		driver: sqlite3.Database
	});

	await db.get("PRAGMA foreign_keys = ON");

	await db.run(`CREATE TABLE IF NOT EXISTS products(
		id INTEGER PRIMARY KEY,
		created INTEGER,
		modified INTEGER,
		name VARCHAR(255) UNIQUE,
		productInfo JSONB)`);

	await db.run(`CREATE TABLE IF NOT EXISTS rules(
		id INTEGER PRIMARY KEY,
		created INTEGER,
		modified INTEGER,
		productId INTEGER NOT NULL REFERENCES products(id),
		name VARCHAR(255) UNIQUE,
		rule JSONB,
		live INTEGER,
		ineligibleCount INTEGER DEFAULT 0,
		eligibleCount INTEGER DEFAULT 0)`);

	await db.run(`CREATE TABLE IF NOT EXISTS conditions(
		id INTEGER PRIMARY KEY,
		created INTEGER,
		modified INTEGER,
		name VARCHAR(255) UNIQUE,
		condition JSONB)`);

	return db;
}
