import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import uploadRoutes from './routes/uploads';
import errorHandler from './middlewares/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorHandler);
export default app;
