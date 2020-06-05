import { Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {

    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query;

        //split will separate each item of the string
        //since it can contain empty space it will be used trim
        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()))

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            //is going to consider at least if there's one item of the search
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            //using distinct to avoid returning the same result more the once
            .select('points.*')
            //it will select only the data from table points, and not the jointed table

        return res.json(points);
    }

    async show(req: Request, res: Response) {
        const id = req.params.id;
        //A deconstruction could be done, writing: const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return res.status(400).json({ message: 'Point not found' });
        }
    
        /**
         * SELECT * FROM items
         * JOIN point_items ON items.id = point_items.item_id
         * WHERE point_items.point_id = {id}
         * SELECT items.title
         */

        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');

        return res.json({ point, items });
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body
    
        //This is a deconstructed form of what would be for instance:
        //const name = req.body.name;
        //const email = req.body.email;
        //etc.
    
        //transaction will make it safer to build dependent queries
        //trx is the name pattern used by the community
        //instead of "await knex()..." we'll now use this const, await trx
    
        const trx = await knex.transaction();
        
        const point = {
            image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedIds = await trx('points').insert(point);
    

        const point_id = insertedIds[0];
    
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        })
    
        await trx('point_items').insert(pointItems);
        
        //commit() is necessary to effectivelly insert the data
        await trx.commit();

        //... spread operator, returns everything an object contains, inside another object
        return res.json({ 
            id: point_id,
            ...point,
         });
    }
};

export default PointsController;