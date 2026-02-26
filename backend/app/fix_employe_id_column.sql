-- Fix the employe_id column type in the evaluations table
-- This script converts the employe_id column from VARCHAR to INTEGER

-- First, check the current column type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluations' AND column_name = 'employe_id';

-- Convert the column type from VARCHAR to INTEGER
ALTER TABLE evaluations 
ALTER COLUMN employe_id TYPE INTEGER USING employe_id::integer;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluations' AND column_name = 'employe_id';

-- Check if there are any foreign key constraints that need to be updated
SELECT constraint_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'evaluations' AND column_name = 'employe_id';

-- If there are foreign key constraints, they should be automatically updated
-- when the column type is changed to match the referenced column type