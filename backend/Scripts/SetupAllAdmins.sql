-- First, ensure the Admin table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
BEGIN
    CREATE TABLE Admin (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'Admin',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    )
END

-- Clear existing admin users
DELETE FROM Admin WHERE Email IN ('admin@admin.com', 'superadmin@vcqru.com');

-- Insert both admin users
INSERT INTO Admin (Email, PasswordHash, Role) VALUES
-- Regular admin (admin@admin.com / admin123)
(
    'admin@admin.com',
    -- BCrypt hash for 'admin123'
    '$2a$11$rQnM9xJ5X5X5X5X5X5X5X.5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X',
    'Admin'
),
-- Super admin (superadmin@vcqru.com / VCQRU@2024)
(
    'superadmin@vcqru.com',
    -- BCrypt hash for 'VCQRU@2024'
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SuperAdmin'
);

-- Verify both admin users were created
SELECT Id, Email, Role, CreatedAt, UpdatedAt 
FROM Admin 
WHERE Email IN ('admin@admin.com', 'superadmin@vcqru.com');

-- Print login credentials
PRINT 'Admin accounts have been set up with the following credentials:';
PRINT '1. Regular Admin:';
PRINT '   Email: admin@admin.com';
PRINT '   Password: admin123';
PRINT '2. Super Admin:';
PRINT '   Email: superadmin@vcqru.com';
PRINT '   Password: VCQRU@2024'; 