-- First, ensure the Admin table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
BEGIN
    CREATE TABLE Admin (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        IsSuperAdmin BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

-- Clear any existing super admin accounts to avoid duplicates
DELETE FROM Admin WHERE Email = 'superadmin@vcqru.com';

-- Insert the super admin account
-- Password: VCQRU@2024
INSERT INTO Admin (Email, PasswordHash, IsSuperAdmin, CreatedAt, UpdatedAt)
VALUES (
    'superadmin@vcqru.com',
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    1,
    GETUTCDATE(),
    GETUTCDATE()
);

-- Verify the super admin was created
SELECT 
    Id,
    Email,
    IsSuperAdmin,
    CreatedAt,
    UpdatedAt
FROM Admin
WHERE Email = 'superadmin@vcqru.com';

-- Print login credentials
PRINT 'Super Admin Login Credentials:';
PRINT 'Email: superadmin@vcqru.com';
PRINT 'Password: VCQRU@2024';
PRINT 'IsSuperAdmin: Yes'; 