import express from 'express';
import homeRouter from './routes/home.router.js';
import studentRouter from './routes/student.router.js';
import logger from './middleware/logger.middleware.js';

import { connectMongoDB, connectAtlasMongoDB } from './config/db/connect.config.js';

const app = express();
const PORT = 3000;
const ATLAS = false;

app.use(express.json());
app.use(logger);

app.use('/', homeRouter);
app.use('/student', studentRouter);


const startServer = async () => {
    ATLAS ? connectAtlasMongoDB() : connectMongoDB();
    app.listen(PORT, ()=> console.log(`✅ Servidor escuchando en http://localhost:${PORT}`));
}

await startServer();