// @ts-nocheck
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI no está definida en el archivo .env');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// User schema/model
interface IUser extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model<IUser>('User', userSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Using database:', MONGO_URI.split('/').pop()?.split('?')[0]);
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

interface LoginBody {
  email: string;
  password: string;
}

// Ruta de prueba
app.get('/', (req: any, res: any) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Login endpoint
const loginHandler = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || typeof user.password !== 'string') {
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
};

// Register endpoint
const registerHandler = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'El correo ya está registrado' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    res.json({ message: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
};

// Endpoint para obtener eventos de Ticketmaster
app.get('/api/ticketmaster', (req: any, res: any) => {
  try {
    const apiKey = process.env.REACT_APP_TICKETMASTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API Key de Ticketmaster no configurada' });
    }
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=MX&apikey=${apiKey}`;
    fetch(url)
      .then(response => response.json())
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ message: 'Error al obtener eventos de Ticketmaster', error: err }));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener eventos de Ticketmaster', error: err });
  }
});

app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));