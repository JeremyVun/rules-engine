import { createProductEngine } from '../engine.js';

const selectProductQuery = "SELECT * FROM products WHERE id = ?";
const selectProductsQuery = "SELECT * FROM products";
const insertProductQuery = `INSERT INTO products(created, modified, name, productInfo)
	VALUES(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, json(?))
	ON CONFLICT(name) DO UPDATE SET productInfo=excluded.productInfo, modified=CURRENT_TIMESTAMP`;
const deleteProductQuery = 'DELETE FROM products WHERE id = ?';

export function mapProductRoutes(app, db) {
	// get list of eligible products using rules engine
	app.post("/products/eligible", async (req, res) => {
		try {
			const engine = await createProductEngine(db);
			const result = await engine.run(req.body);
			res.send({
				results: result.results,
				failureResults: result.failureResults,
				events: result.events,
				failureEvents: result.failureEvents
			});
		} catch (error) {
			res.status(500).send(error.message);
		}
	});

	app.get("/products/:id", async (req, res) => {
		const result = await db.get(insertProductQuery, req.params.id);
		if (result == undefined) {
			res.sendStatus(404);
			return;
		}

		result.productInfo = JSON.parse(result.productInfo)
		res.send(result);
	});

	app.get("/products", async (req, res) => {
		const results = await db.all(selectProductsQuery);
		results.forEach(result => {
			result.productInfo = JSON.parse(result.productInfo)
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
