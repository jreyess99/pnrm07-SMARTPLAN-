// @ts-nocheck
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
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
  favorites: string[]; // IDs de panoramas favoritos
  attending: string[]; // IDs de panoramas a los que asistirá
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  favorites: [String],
  attending: [String],
});
const User = mongoose.model<IUser>('User', userSchema);

// Calificar panorama
const ratingSchema = new mongoose.Schema({
  panoramaId: String,
  userId: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});
const Rating = mongoose.model('Rating', ratingSchema);

// Reportar panorama
const reportSchema = new mongoose.Schema({
  panoramaId: String,
  userId: String,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

// Conexión a MongoDB (solo si no está ya conectada)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
      console.log('Using database:', MONGO_URI.split('/').pop()?.split('?')[0]);
    })
    .catch((err: Error) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

// Ruta de prueba
app.get('/', (req: any, res: any) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Login endpoint
const loginHandler = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }
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
    // Excluir el hash de la contraseña del usuario retornado
    const { password: _pw, ...userData } = user.toObject();
    res.json({ user: userData, token });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
};

// Register endpoint
const registerHandler = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }
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

// Middleware para autenticar JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Favoritos: agregar
app.post('/api/favorites/:panoramaId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  if (!user.favorites.includes(req.params.panoramaId)) {
    user.favorites.push(req.params.panoramaId);
    await user.save();
  }
  res.json({ favorites: user.favorites });
});
// Favoritos: quitar
app.delete('/api/favorites/:panoramaId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  user.favorites = user.favorites.filter(id => id !== req.params.panoramaId);
  await user.save();
  res.json({ favorites: user.favorites });
});

// Asistiré: agregar
app.post('/api/attending/:panoramaId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  if (!user.attending.includes(req.params.panoramaId)) {
    user.attending.push(req.params.panoramaId);
    await user.save();
  }
  res.json({ attending: user.attending });
});
// Asistiré: quitar
app.delete('/api/attending/:panoramaId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  user.attending = user.attending.filter(id => id !== req.params.panoramaId);
  await user.save();
  res.json({ attending: user.attending });
});

// Endpoint para obtener eventos de Ticketmaster
app.get('/api/ticketmaster', (req: any, res: any) => {
  try {
    const apiKey = process.env.REACT_APP_TICKETMASTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API Key de Ticketmaster no configurada' });
    }
    // Parámetros dinámicos
    const countryCode = req.query.countryCode || 'MX';
    const classificationName = req.query.classificationName;
    let url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${countryCode}&apikey=${apiKey}`;
    if (classificationName) {
      url += `&classificationName=${encodeURIComponent(classificationName)}`;
    }
    fetch(url)
      .then(response => response.json())
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ message: 'Error al obtener eventos de Ticketmaster', error: err }));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener eventos de Ticketmaster', error: err });
  }
});

// Calificar panorama
app.post('/api/panoramas/:id/rate', authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating) return res.status(400).json({ message: 'Rating requerido' });
  const panoramaId = req.params.id;
  const userId = req.userId;
  // Permitir solo una calificación por usuario por panorama
  await Rating.deleteMany({ panoramaId, userId });
  const newRating = new Rating({ panoramaId, userId, rating, comment });
  await newRating.save();
  res.json({ message: 'Calificación guardada' });
});

// Obtener calificaciones promedio y comentarios
app.get('/api/panoramas/:id/ratings', async (req, res) => {
  const ratings = await Rating.find({ panoramaId: req.params.id });
  if (!ratings.length) return res.json({ avg: null, ratings: [] });
  const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
  res.json({ avg, ratings });
});

// Reportar panorama
app.post('/api/panoramas/:id/report', authMiddleware, async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Motivo requerido' });
  const panoramaId = req.params.id;
  const userId = req.userId;
  const newReport = new Report({ panoramaId, userId, reason });
  await newReport.save();
  res.json({ message: 'Reporte enviado' });
});

// Endpoint para obtener el usuario actual
app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ _id: user._id, email: user.email, favorites: user.favorites, attending: user.attending });
});

// Obtener cantidad de favoritos global por panorama
app.get('/api/favorites-count/:panoramaId', async (req, res) => {
  const count = await User.countDocuments({ favorites: req.params.panoramaId });
  res.json({ panoramaId: req.params.panoramaId, count });
});

app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);

export default app;
