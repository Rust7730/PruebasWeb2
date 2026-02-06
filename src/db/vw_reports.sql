-- ==============================================================================
-- VIEW 1: Ranking de libros más prestados
-- TÉCNICA: Window Function (RANK) + Agregación (COUNT)
-- REQUISITOS: Búsqueda por title/author, Paginación.
-- GRAIN: Un registro por Libro.
-- NO SELECT *: Se especifican columnas explícitas.
-- ==============================================================================
CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT 
    b.id AS book_id,
    b.title,
    b.author,
    b.category,
    COUNT(l.id) AS total_loans,
    RANK() OVER (ORDER BY COUNT(l.id) DESC) as popularity_rank,
    ROUND((COUNT(l.id)::numeric / NULLIF((SELECT COUNT(*) FROM loans), 0) * 100), 2) as loan_percentage
FROM books b
JOIN copies c ON b.id = c.book_id
LEFT JOIN loans l ON c.id = l.copy_id
GROUP BY b.id, b.title, b.author, b.category;