import express from 'express';
import cors from 'cors';
// using [npm install @types/express -D] is required to access typescript's type
import path from 'path';
import routes from './routes';

const app = express(); 

app.use(cors());
//express doesn't understand JSON is to be used, its use need to be indicated:
app.use(express.json());

app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));


app.listen(3333);