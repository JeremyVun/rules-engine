import express from 'express';
import { initDb } from './db.js';
import { mapProductRoutes } from './routes/product.js';
import { mapConditionRoutes } from './routes/conditions.js';
import { mapRulesRoutes } from './routes/rules.js';

const app = express();
app.use(express.json());
const db = await initDb();

// Products
mapProductRoutes(app, db);

mapConditionRoutes(app, db);

mapRulesRoutes(app, db);

// Start the api
app.listen(3000);
