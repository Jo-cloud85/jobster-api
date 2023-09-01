import express from 'express';
import dotenv from 'dotenv'
import 'express-async-errors';
import path from 'path';

// In ES6 module, you can only use __dirname this way
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// extra security packages
import helmet from 'helmet';
//import xss from 'xss-clean';

// connectDB
import connectDB from './db/connect.js';
import authenticateUser from './middleware/authentication.js';

// routers
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';

// error handler
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';


const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

//this is mainly for deploying to Render/Heroku purposes and you have to put it 
//before all the middlewares
app.set('trust proxy', 1); 

app.use(express.static(path.resolve(__dirname, './client/build')));
app.use(express.json());

app.use(helmet());
//app.use(xss());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

// serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
