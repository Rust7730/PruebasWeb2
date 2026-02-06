import { query } from './db';

export async function getMostBorrowedBooks(
  search: string = '', 
  page: number = 1, 
  limit: number = 10
) {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT * FROM vw_most_borrowed_books 
    WHERE title ILIKE $1 OR author ILIKE $1
    ORDER BY popularity_rank ASC
    LIMIT $2 OFFSET $3
  `;
  
  const values = [`%${search}%`, limit, offset];
  const { rows } = await query(sql, values);

  return rows;
}