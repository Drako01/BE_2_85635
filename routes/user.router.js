import { Router } from "express";
import { User } from '../config/models/user.model.js';
import bcrypt from 'bcrypt';
import { requireLogin, alreadyLogin } from '../middleware/auth.middleware.js';

const router = new Router();

router.post('/register', alreadyLogin, async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios!" });
        }

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ error: `El email: ${email} ya esta Registrando por otro usuario` });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ first_name, last_name, email, age, password: hash });
        await user.save();

        res.status(201).json({ message: "Usuario registrado con exito", user: user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/login', alreadyLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios!" });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: `El email: ${email} no corresponde a un Usuario existente.!` });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Credenciales inválidas.!" });

        req.session.user = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age,
            email: user.email
        }

        res.status(200).json({ message: "Login exitoso", user: req.session.user })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


router.post('/logout', requireLogin, async (req, res) => {
    const { first_name, last_name, email, age } = req.session.user;
    const full_name = first_name + ' ' + last_name;
    req.session.destroy(() => {
        res.status(200).json({ message: "Logout Exitoso (Sesion eliminada)" , byebye: `${full_name}`})
    })
})

router.get('/', requireLogin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users: users })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default router;
