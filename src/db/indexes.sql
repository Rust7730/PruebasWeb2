CREATE INDEX idx_books_title_author ON books(title, author);
CREATE INDEX idx_copies_book_id ON copies(book_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_copy_id ON loans(copy_id);
CREATE INDEX idx_loans_overdue ON loans(due_at) WHERE returned_at IS NULL;
CREATE INDEX idx_loans_loaned_at ON loans(loaned_at);
CREATE INDEX idx_fines_loan_id ON fines(loan_id);