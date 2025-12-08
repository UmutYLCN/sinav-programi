-- Add cakisma_onayli column to exams table
-- This column allows controlled conflicts (e.g., when two departments take the same course and class capacity is low)

ALTER TABLE exams
ADD COLUMN cakisma_onayli BOOLEAN NOT NULL DEFAULT FALSE
COMMENT 'Kontrollü çakışma onayı - çakışma tespit edilse bile sınav kaydedilebilir';

