import express from 'express';
import router from './routes/routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',(req,res)=>{
res.render('home')
})
app.use('/user', router);

app.listen(4000, () => {
  console.log('server is running at the port 4000');
});