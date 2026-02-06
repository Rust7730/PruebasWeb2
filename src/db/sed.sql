-- Limpiar datos existentes para evitar duplicados al reiniciar
TRUNCATE TABLE fines, loans, copies, books, members RESTART IDENTITY CASCADE;

-- ==============================================================================
-- 1. INSERTAR MIEMBROS (15 Usuarios para probar paginación)
-- ==============================================================================
INSERT INTO members (name, email, member_type, joined_at) VALUES
('Ana García', 'ana.garcia@email.com', 'VIP', NOW() - INTERVAL '2 years'),
('Carlos López', 'carlos.lopez@email.com', 'STANDARD', NOW() - INTERVAL '1 year'),
('María Rodriguez', 'maria.rodriguez@email.com', 'STUDENT', NOW() - INTERVAL '6 months'),
('Juan Pérez', 'juan.perez@email.com', 'STANDARD', NOW() - INTERVAL '3 months'),
('Lucía Fernández', 'lucia.fernandez@email.com', 'STUDENT', NOW() - INTERVAL '1 month'),
('Pedro Sánchez', 'pedro.sanchez@email.com', 'STANDARD', NOW() - INTERVAL '2 weeks'),
('Sofía Martínez', 'sofia.martinez@email.com', 'VIP', NOW() - INTERVAL '1 week'),
('Miguel Ángel', 'miguel.angel@email.com', 'STUDENT', NOW() - INTERVAL '5 days'),
('Laura Torres', 'laura.torres@email.com', 'STANDARD', NOW() - INTERVAL '3 days'),
('David Ruiz', 'david.ruiz@email.com', 'STANDARD', NOW() - INTERVAL '1 day'),
('Elena Gomez', 'elena.gomez@email.com', 'VIP', NOW() - INTERVAL '2 years'),
('Pablo Diaz', 'pablo.diaz@email.com', 'STUDENT', NOW() - INTERVAL '1 year'),
('Carmen Vazquez', 'carmen.vazquez@email.com', 'STANDARD', NOW() - INTERVAL '8 months'),
('Jorge Ramos', 'jorge.ramos@email.com', 'STANDARD', NOW() - INTERVAL '4 months'),
('Patricia Gil', 'patricia.gil@email.com', 'VIP', NOW() - INTERVAL '2 months');

-- ==============================================================================
-- 2. INSERTAR LIBROS (10 Libros variados)
-- ==============================================================================
INSERT INTO books (title, author, category, isbn) VALUES
('Cien Años de Soledad', 'Gabriel García Márquez', 'Novela', '978-84-376-0494-7'),
('Don Quijote de la Mancha', 'Miguel de Cervantes', 'Clásico', '978-84-204-1214-6'),
('Clean Code', 'Robert C. Martin', 'Tecnología', '978-0132350884'),
('The Pragmatic Programmer', 'Andrew Hunt', 'Tecnología', '978-0201616224'),
('Dune', 'Frank Herbert', 'Ciencia Ficción', '978-0441172719'),
('1984', 'George Orwell', 'Ciencia Ficción', '978-0451524935'),
('Sapiens', 'Yuval Noah Harari', 'Historia', '978-0062316097'),
('El Señor de los Anillos', 'J.R.R. Tolkien', 'Fantasía', '978-0544003415'),
('Hábitos Atómicos', 'James Clear', 'Autoayuda', '978-0735211292'),
('Design Patterns', 'Erich Gamma', 'Tecnología', '978-0201633610');

-- ==============================================================================
-- 3. INSERTAR COPIAS (Inventario - Algunos libros tienen más copias que otros)
-- ==============================================================================
-- Clean Code tiene muchas copias (será popular)
INSERT INTO copies (book_id, barcode, status) VALUES
(3, 'CC-001', 'LOANED'), (3, 'CC-002', 'LOANED'), (3, 'CC-003', 'AVAILABLE'),
(4, 'PP-001', 'AVAILABLE'), (4, 'PP-002', 'LOANED'),
(1, 'CAS-001', 'AVAILABLE'), (1, 'CAS-002', 'LOST'), -- Uno perdido para vw_inventory_health
(5, 'DUN-001', 'LOANED'), (5, 'DUN-002', 'LOANED'), (5, 'DUN-003', 'MAINTENANCE'),
(2, 'DQ-001', 'AVAILABLE'),
(6, '1984-001', 'LOANED'),
(7, 'SAP-001', 'AVAILABLE'),
(8, 'LOTR-001', 'AVAILABLE'), (8, 'LOTR-002', 'AVAILABLE'),
(9, 'HA-001', 'LOANED'),
(10, 'DP-001', 'AVAILABLE');

-- ==============================================================================
-- 4. INSERTAR PRÉSTAMOS (Escenarios para las Vistas)
-- ==============================================================================

-- A) Préstamos Históricos (Devueltos a tiempo)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(3, 1, NOW() - INTERVAL '60 days', NOW() - INTERVAL '53 days', NOW() - INTERVAL '55 days'),
(4, 2, NOW() - INTERVAL '50 days', NOW() - INTERVAL '43 days', NOW() - INTERVAL '45 days'),
(6, 3, NOW() - INTERVAL '40 days', NOW() - INTERVAL '33 days', NOW() - INTERVAL '35 days');

-- B) Préstamos Históricos (Devueltos TARDE -> Generaron multa)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(1, 2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '23 days', NOW() - INTERVAL '20 days'), -- 3 días tarde
(5, 4, NOW() - INTERVAL '45 days', NOW() - INTERVAL '38 days', NOW() - INTERVAL '30 days'); -- 8 días tarde

-- C) Préstamos ACTIVOS (A tiempo)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(14, 1, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', NULL),
(15, 5, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', NULL),
(7, 6, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', NULL);

-- D) Préstamos ACTIVOS (VENCIDOS / MOROSOS -> Para vw_overdue_loans)
-- IMPORTANTE: due_at debe ser menor a NOW()
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(1, 3, NOW() - INTERVAL '20 days', NOW() - INTERVAL '13 days', NULL), -- 13 días de atraso (Multa alta)
(2, 7, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', NULL),  -- 3 días de atraso (Multa baja)
(5, 8, NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days', NULL),  -- 8 días de atraso (Multa media)
(8, 9, NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days', NULL), -- Muy tarde
(12, 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', NULL), -- Reincidente
(16, 4, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day', NULL);   -- Recién vencido

-- ==============================================================================
-- 5. INSERTAR MULTAS (Para vw_fines_summary)
-- ==============================================================================
-- Multas pagadas (asociadas a los préstamos devueltos tarde en bloque B)
INSERT INTO fines (loan_id, amount, status, paid_at) VALUES
(4, 5.00, 'PAID', NOW() - INTERVAL '19 days'),  -- Multa pagada
(5, 20.00, 'PAID', NOW() - INTERVAL '29 days'); -- Multa pagada

-- Multas pendientes (quizás de préstamos anteriores no listados arriba explícitamente o generados manualmente)
INSERT INTO fines (loan_id, amount, status, paid_at) VALUES
(1, 10.00, 'PENDING', NULL), -- Multa antigua sin pagar
(2, 5.00, 'PENDING', NULL);