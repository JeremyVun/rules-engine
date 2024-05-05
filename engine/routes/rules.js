const selectRuleQuery = "SELECT * FROM rules WHERE id = ?";
const selectRuleByNameQuery = "SELECT * FROM rules WHERE name = ?";
const selectRulesQuery = "SELECT * FROM rules";
const insertRuleQuery = `INSERT INTO rules(created, modified, name, productId, rule, live)
	VALUES(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, json(?), ?)
	ON CONFLICT(name) DO UPDATE SET rule=excluded.rule, live=excluded.live, modified=CURRENT_TIMESTAMP`;
const deleteRuleQuery = 'DELETE FROM rules WHERE id = ?';

export function mapRulesRoutes(app, db) {
	app.get("/rules/:id", async (req, res) => {
		const result = await db.get(selectRuleQuery, req.params.id);
		if (result == undefined) {
			res.sendStatus(404);
			return;
		}

		result.rule = JSON.parse(result.rule);
		res.send(result);
	});

	app.get("/rules", async (req, res) => {
		const results = await db.all(selectRulesQuery);
		results.forEach(result => result.rule = JSON.parse(result.rule));
		res.send(results);
	});

	app.post("/rules", async (req, res) => {
		try {
			// Dynamically add a "live" condition
			req.body.rule.conditions.all = [
				{
					fact: "live",
					operator: 'greaterThan',
					value: 0,
					params: {
						name: req.body.name
					}
				},
				structuredClone(req.body.rule.conditions)
			];

			const result = await db.run(insertRuleQuery, [
				req.body.name,
				req.body.productId,
				JSON.stringify(req.body.rule),
				req.body.live ?? 0
			]);
			res.send(result);
		} catch(error) {
			res.status(500).send(error.message);
		}
	});

	app.delete("/rules/:id", async (req, res) => {
		const result = await db.run(deleteRuleQuery, req.params.id);
		res.send(result);
	});
}
