import { Request, Response } from 'express';
import { query } from '../db';

export const getAllCategories = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const result = await query(
            'SELECT * FROM categories WHERE user_id = $1 OR is_default = TRUE ORDER BY name ASC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCategory = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const { name, type } = req.body;

        if (!name || !type) {
            res.status(400).json({ message: 'Name and type are required' });
            return;
        }

        const result = await query(
            'INSERT INTO categories (user_id, name, type, is_default) VALUES ($1, $2, $3, FALSE) RETURNING *',
            [userId, name, type]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating category', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCategory = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        // Ensure we only delete custom categories owned by the user
        const check = await query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
        if (check.rows.length === 0) {
            res.status(404).json({ message: 'Category not found or cannot delete default category' });
            return;
        }

        await query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category', error);
        res.status(500).json({ message: 'Server error' });
    }
};
