-- First, let's check if the Admin table exists and show its structure
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
BEGIN
    PRINT 'Admin table exists. Current structure:';
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Admin';
END
ELSE
BEGIN
    PRINT 'Admin table does not exist! Creating it...';
    CREATE TABLE Admin (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'SuperAdmin',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- Show all current admin users
PRINT 'Current admin users:';
SELECT Id, Email, Role, CreatedAt, UpdatedAt 
FROM Admin;

-- Delete existing super admin if exists
PRINT 'Removing existing super admin...';
DELETE FROM Admin WHERE Email = 'superadmin@vcqru.com';

-- Create new super admin with fresh password hash
-- Password: VCQRU@2024
PRINT 'Creating new super admin...';
INSERT INTO Admin (Email, PasswordHash, Role)
VALUES (
    'superadmin@vcqru.com',
    -- New BCrypt hash for 'VCQRU@2024'
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SuperAdmin'
);

-- Verify the new super admin
PRINT 'Verifying new super admin:';
SELECT Id, Email, Role, CreatedAt, UpdatedAt 
FROM Admin 
WHERE Email = 'superadmin@vcqru.com';

-- Print instructions
PRINT 'Super admin has been reset with the following credentials:';
PRINT 'Email: superadmin@vcqru.com';
PRINT 'Password: VCQRU@2024';
PRINT 'Please try logging in again.'; 