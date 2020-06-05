import express from 'express';
//making the connection with the database importing knex

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();


//LIST ITEMS
routes.get('/items', itemsController.index);

//CREATE POINTS
routes.post('/points', pointsController.create);

//LIST POINTS
routes.get('/points', pointsController.index);

//SHOW POINTS
routes.get('/points/:id', pointsController.show);

//routes.ts will be imported in server.ts
export default routes;