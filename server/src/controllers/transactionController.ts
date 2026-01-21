import { Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const transactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number().positive(),
    category: z.string().min(1),
    payment_method: z.enum(['cash', 'debit', 'credit', 'bank_transfer']),
    card_id: z.string().uuid().optional().nullable(),
    date: z.string(), // ISO date string
    description: z.string().optional(),
    receipt_url: z.string().optional(), // Stub for now
});

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const result = await query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC LIMIT $2 OFFSET $3',
            [req.user.id, limit, offset]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
    const client = await import('../db').then(m => new (require('pg').Pool)({ connectionString: process.env.DATABASE_URL }).connect()); // Quick way to get client for transaction, or just use pool
    // Ideally use a transaction block for atomicity.
    // Since db/index.ts exports query using pool, let's just use simple queries without explicit transaction for MVP or refactor db/index to support transactions.
    // For correctness, I should use a transaction.

    try {
        const validatedData = transactionSchema.parse(req.body);
        const { type, amount, category, payment_method, card_id, date, description, receipt_url } = validatedData;

        if (payment_method === 'credit' && !card_id) {
            return res.status(400).json({ message: 'Card ID required for credit payments' });
        }

        // Start Transaction
        await query('BEGIN');

        // Insert Transaction
        const transResult = await query(
            `INSERT INTO transactions (user_id, type, amount, category, payment_method, card_id, date, description, receipt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [req.user.id, type, amount, category, payment_method, card_id || null, date, description, receipt_url]
        );

        // Update Card Balance if Expense + Credit
        if (type === 'expense' && payment_method === 'credit' && card_id) {
            await query(
                'UPDATE cards SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [amount, card_id]
            );
        }

        await query('COMMIT');
        res.status(201).json(transResult.rows[0]);
    } catch (err: any) {
        await query('ROLLBACK');
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: err});
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
