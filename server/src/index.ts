import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import cardRoutes from './routes/cardRoutes';
import transactionRoutes from './routes/transactionRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('MoneyMesh API is running');
});

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    try {
        // Test database connection
        const { query, initDb } = await import('./db');
        await query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        await initDb();
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
});
