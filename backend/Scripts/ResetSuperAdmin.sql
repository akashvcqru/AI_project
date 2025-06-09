-- Ensure Admin table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
BEGIN
    CREATE TABLE Admin (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'SuperAdmin',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    )
END

-- Delete existing super admin if exists
DELETE FROM Admin WHERE Email = 'superadmin@vcqru.com';

-- Insert fresh super admin user
-- Password: VCQRU@2024
INSERT INTO Admin (Email, PasswordHash, Role)
VALUES (
    'superadmin@vcqru.com',
    -- Fresh BCrypt hash for 'VCQRU@2024'
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SuperAdmin'
);

-- Verify the super admin was created
SELECT Id, Email, Role, CreatedAt, UpdatedAt 
FROM Admin 
WHERE Email = 'superadmin@vcqru.com'; 