const selectRuleQuery = "SELECT * FROM rules WHERE id = ?";
const selectRulesQuery = "SELECT * FROM rules";
const insertRuleQuery = 'INSERT INTO rules(name, rule, live) VALUES(?, json(?), ?) ON CONFLICT(name) DO UPDATE SET rule=excluded.rule, live=excluded.live';
const deleteRuleQuery = 'DELETE FROM rules WHERE id = ?';

export function mapRulesRoutes(app, db) {
	app.get("/rules/:id", async (req, res) => {
		const result = await db.get(selectRuleQuery, req.params.id);
		result.rule = JSON.parse(result.rule);
		res.send(result);
	});

	app.get("/rules", async (req, res) => {
		const results = await db.all(selectRulesQuery);
		results.forEach(result => result.rule = JSON.parse(result.rule));
		res.send(results);
	});

	app.post("/rules", async (req, res) => {
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

		const result = await db.run(insertRuleQuery, [req.body.name, JSON.stringify(req.body.rule), req.body.live ?? 0]);
		res.send(result);
	});

	app.delete("/rules/:id", async (req, res) => {
		const result = await db.run(deleteRuleQuery, req.params.id);
		res.send(result);
	});
}
