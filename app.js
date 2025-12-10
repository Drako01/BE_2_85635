import express from 'express';

import homeRouter from './routes/home.router.js';
import studentRouter from './routes/student.router.js';
import userRouter from './routes/user.router.js';
import authRouter from './routes/auth.router.js';

import profileRouter from './routes/profile.router.js';


import { connectAuto } from './config/db/connect.config.js';
import logger from './middleware/logger.middleware.js';

import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { initPassport } from './config/auth/passport.config.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;


app.use(express.json());
app.use(logger);
app.use(cookieParser(SESSION_SECRET))

const startServer = async () => {

    await connectAuto();

    const store = MongoStore.create({
        client: (await import("mongoose")).default.connection.getClient(),
        ttl: 60 * 60,
    })

    app.use(
        session({
            secret: SESSION_SECRET || "clase_secreta",
            resave: false,
            saveUninitialized: false,
            store,
            cookie: {
                maxAge: 1 * 60 * 60 * 1000, // 1hr
                httpOnly: true,
                signed: true
            }
        })
    )

    initPassport();
    app.use(passport.initialize());
    app.use(passport.session());

    // Llamadas al enrutador
    app.use('/', homeRouter);
    app.use('/student', studentRouter);
    app.use('/user', userRouter);
    app.use('/auth', authRouter);
    app.use('/auth/profile', profileRouter);


    app.listen(PORT, () => console.log(`✅ Servidor escuchando en http://localhost:${PORT}`));
}

await startServer();