import { createProductEngine } from '../engine.js';

const selectProductQuery = "SELECT * FROM products WHERE id = ?";
const selectProductsQuery = "SELECT * FROM products";
const insertProductQuery = 'INSERT INTO products(name, product_info, live) VALUES(?, json(?), ?) ON CONFLICT(name) DO UPDATE SET product_info=excluded.product_info, live=excluded.live';
const deleteProductQuery = 'DELETE FROM products WHERE id = ?';

export function mapProductRoutes(app, db) {
	// get list of eligible products using rules engine
	app.post("/products/eligible", async (req, res) => {
		const engine = await createProductEngine(db);
		const result = await engine.run(req.body);
		res.send({
			results: result.results,
			failureResults: result.failureResults,
			events: result.events,
			failureEvents: result.failureEvents
		});
	});

	app.get("/products/:id", async (req, res) => {
		const result = await db.get(insertProductQuery, req.params.id);
		result.productInfo = JSON.parse(result.product_info)
		delete result.product_info;
		res.send(result);
	});

	app.get("/products", async (req, res) => {
		const results = await db.all(selectProductsQuery);
		results.forEach(result => {
			result.productInfo = JSON.parse(result.product_info)
			delete result.product_info;
		});
		res.send(results);
	});

	app.post("/products", async (req, res) => {
		const result = await db.run(insertProductQuery, [req.body.name, JSON.stringify(req.body.productInfo, req.body.live ?? 0)]);
		res.send(result);
	});

	app.delete("/products/:id", async (req, res) => {
		const result = await db.run(deleteProductQuery, req.params.id);
		res.send(result);
	});
}
