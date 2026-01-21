import { Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const cardSchema = z.object({
    card_name: z.string().min(1),
    card_type: z.string().optional(),
    last4: z.string().length(4),
    credit_limit: z.number().min(0),
    current_balance: z.number().min(0),
    expiry_date: z.string().regex(/^\d{2}\/\d{2}$/, "Format MM/YY").optional(),
    due_day: z.number().min(1).max(31).optional(),
});

export const getCards = async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        const cards = result.rows.map(card => {
            const limit = parseFloat(card.credit_limit);
            const balance = parseFloat(card.current_balance);
            const available_credit = limit - balance;
            const utilization = limit > 0 ? (balance / limit) : 0;
            return {
                ...card,
                available_credit,
                utilization_warning: utilization >= 0.9
            };
        });
        res.json(cards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCard = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = cardSchema.parse(req.body);
        const { card_name, card_type, last4, credit_limit, current_balance, expiry_date, due_day } = validatedData;

        const result = await query(
            `INSERT INTO cards (user_id, card_name, card_type, last4, credit_limit, current_balance, expiry_date, due_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.user.id, card_name, card_type, last4, credit_limit, current_balance, expiry_date, due_day]
        );

        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: err });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // Basic implementation: update allowed fields. Using partial schema could be better but keeping it simple.
        // For MVP, just update mostly everything or specific fields. Let's assume body contains updates.
        const { card_name, current_balance } = req.body; // MVP simplified update

        const result = await query(
            `UPDATE cards SET card_name = COALESCE($1, card_name), current_balance = COALESCE($2, current_balance), updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *`,
            [card_name, current_balance, id, req.user.id]
        );

        if (result.rows.length === 0) return res.sendStatus(404);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check for transactions
        const transCheck = await query('SELECT id FROM transactions WHERE card_id = $1 LIMIT 1', [id]);
        if (transCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Cannot delete card with linked transactions. Archive instead.' });
        }

        const result = await query('DELETE FROM cards WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rows.length === 0) return res.sendStatus(404);

        res.json({ message: 'Card deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
