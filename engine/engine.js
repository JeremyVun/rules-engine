import engine from 'json-rules-engine';

const selectProductsQuery = "SELECT * FROM products";
const selectRulesQuery = "SELECT * FROM rules";
const selectConditionsQuery = "SELECT * FROM conditions";

export async function createProductEngine(db) {
	let [conditions, rules, products] = await Promise.all([
		db.all(selectConditionsQuery),
		db.all(selectRulesQuery),
		db.all(selectProductsQuery)
	]);

	const productEngine = new engine.Engine();

	// add "live" fact
	productEngine.addFact('live', async (params, almanac) => {
		const rule = rules.find(r => r.name == params.name);
		return rule.live ?? 0;
	})

	for (let i=0; i<conditions.length; i++) {
		const condition = conditions[i];
		productEngine.setCondition(condition.name, JSON.parse(condition.condition));
	}

	for (let i=0; i<rules.length; i++) {
		const rule = rules[i];

		rule.rule = JSON.parse(rule.rule);
		rule.rule.event = {
			type: "eligibility",
			params: {
				productId: rule.productId,
				productName: products.find(p => p.id == rule.productId).name,
				ruleId: rule.id,
				ruleName: rule.name
			}
		};
		rule.rule.name = rule.name;

		productEngine.addRule(rule.rule);
	}

	// event listeners to update metrics
	productEngine
		.on('success', async({ type, params }) => {
			await db.run("UPDATE rules SET eligibleCount = eligibleCount + 1 WHERE id = ?", params.ruleId);
		})
		.on('failure', async({ type, params }) => {
			await db.run("UPDATE rules SET ineligibleCount = ineligibleCount + 1 WHERE id = ?", params.ruleId);
		});

	return productEngine;
}

