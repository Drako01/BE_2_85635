import { Router } from "express";
import { User } from '../config/models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from "passport";
import { requireLogin, alreadyLogin, requireJWT } from '../middleware/auth.middleware.js';


const router = new Router();

router.post("/register", alreadyLogin, async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios!" });
    }

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: `El email: ${email} ya esta Registrando por otro usuario` });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ first_name, last_name, email, age, password: hash });

    res.status(201).json({ message: "Usuario registrado con exito", user: user });
})

router.post('/login', alreadyLogin, async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info?.message || "Credenciales invalidas" });

        req.logIn(user, { session: true }, (err2) => {
            if (err2) return next(err2);
            req.session.user = user;
            return res.json({ message: "Login ok (session)", user: user });
        });
    })(req, res, next)
})

router.post('/logout', requireLogin, async (req, res, next) => {
    //Evitar que passport intente regenerar 
    req.logout({ keepSessionInfo: true }, (err) => {
        if (err) return next(err);

        // Ahora si, destruimos la sesion del store
        if (req.session) {
            req.session.destroy((err2) => {
                if (err2) return next(err2);

                // Limpieza de cookies
                res.clearCookie("connect.sid");
                return res.json({ message: "Logout Ok (sin session activa)" })
            })
        }
    })
});

router.get("/me", requireLogin, (req, res) => {
    res.json({user: req.session.user})
})


// Estrategia de Github
router.get("/github", passport.authenticate("github", { scope: ["user:email"]}));
router.get("/sessions/github/callback", 
    passport.authenticate("github", { failureRedirect: "/github/fail"}),
    (req, res) => {
        req.session.user = req.user;
        res.json({ message: "Login Ok (GitHub)", user: req.user});
    }
);

router.get("/github/fail", (req, res) => res.status(401).json({error: "Github Auth fallo"}));

/** JWT */
router.post("/jwt/login", async (req, res) => {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u || !u.password) return res.status(400).json({ error: "Credenciales inválidas" });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(400).json({ error: "Credenciales inválidas" });

    const payload = { sub: String(u._id), email: u.email, role: u.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login OK (JWT)", token });
});

router.get("/jwt/me", requireJWT, async (req, res) => {
    // req.jwt viene del middleware
    const u = await User.findById(req.jwt.sub).lean();
    if (!u) return res.status(404).json({ error: "No encontrado" });
    const { first_name, last_name, email, age, role } = u;
    res.json({ first_name, last_name, email, age, role });
});

export default router;