import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function initDb() {
	const db = await open({
		filename: './database.db',
		driver: sqlite3.Database
	});

	await db.run('CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name VARCHAR(255) UNIQUE, product_info JSONB)');
	await db.run('CREATE TABLE IF NOT EXISTS metrics(id INTEGER PRIMARY KEY, product_id INTEGER, elibigleCount INTEGER, ineligibleCount INTEGER)');
	await db.run('CREATE TABLE IF NOT EXISTS rules(id INTEGER PRIMARY KEY, product_id INTEGER UNIQUE, name VARCHAR(255) UNIQUE, rule JSONB, live INTEGER)');
	await db.run('CREATE TABLE IF NOT EXISTS conditions(id INTEGER PRIMARY KEY, name VARCHAR(255) UNIQUE, condition JSONB)');
	return db;
}
