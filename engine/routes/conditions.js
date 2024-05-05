const selectConditionQuery = "SELECT * FROM conditions WHERE id = ?";
const selectConditionsQuery = "SELECT * FROM conditions";
const insertConditionQuery = `INSERT INTO conditions(created, modified, name, condition)
	VALUES(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, json(?))
	ON CONFLICT(name) DO UPDATE SET condition=excluded.condition, modified=CURRENT_TIMESTAMP`;
const deleteConditionQuery = 'DELETE FROM conditions WHERE id = ?';

export function mapConditionRoutes(app, db) {
	app.get("/conditions/:id", async (req, res) => {
		const result = await db.get(selectConditionQuery, req.params.id);
		if (result == undefined) {
			res.sendStatus(404);
			return;
		}

		result.condition = JSON.parse(result.condition);
		res.send(result);
	});

	app.get("/conditions", async (req, res) => {
		const results = await db.all(selectConditionsQuery);
		results.forEach(result => result.condition = JSON.parse(result.condition));
		res.send(results);
	});

	app.post("/conditions", async (req, res) => {
		const result = await db.run(insertConditionQuery, [req.body.name, JSON.stringify(req.body.condition)]);
		res.send(result);
	});

	app.delete("/conditions/:id", async (req, res) => {
		const result = await db.run(deleteConditionQuery, req.params.id);
		res.send(result);
	});
}
