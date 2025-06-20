-- First, ensure the Admin table exists
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

-- Check if super admin user already exists
IF NOT EXISTS (SELECT * FROM Admin WHERE Email = 'superadmin@vcqru.com')
BEGIN
    -- Insert super admin user with hashed password
    -- Password: VCQRU@2024
    INSERT INTO Admin (Email, PasswordHash, Role)
    VALUES (
        'superadmin@vcqru.com',
        -- This is the BCrypt hash for 'VCQRU@2024'
        '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'SuperAdmin'
    )
END
ELSE
BEGIN
    -- Update existing super admin user's password
    UPDATE Admin 
    SET 
        PasswordHash = '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        Role = 'SuperAdmin',
        UpdatedAt = GETDATE()
    WHERE Email = 'superadmin@vcqru.com'
END

-- Verify the super admin user was created/updated
SELECT Id, Email, Role, CreatedAt, UpdatedAt FROM Admin WHERE Email = 'superadmin@vcqru.com' 