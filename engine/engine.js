import engine from 'json-rules-engine';

const selectRulesQuery = "SELECT * FROM rules";
const selectConditionsQuery = "SELECT * FROM conditions";

export async function createProductEngine(db) {
	const conditions = await db.all(selectConditionsQuery);
	const rules = await db.all(selectRulesQuery);
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
			type: "eligible"
		};
		rule.rule.name = rule.name;

		productEngine.addRule(rule.rule);
	}

	return productEngine;
}

