-- First, ensure the Admin table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
BEGIN
    CREATE TABLE Admin (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'Admin',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    )
END

-- Check if admin user already exists
IF NOT EXISTS (SELECT * FROM Admin WHERE Email = 'admin@admin.com')
BEGIN
    -- Insert admin user with hashed password
    -- Note: In production, use proper password hashing in the application
    INSERT INTO Admin (Name, Email, PasswordHash, Role)
    VALUES (
        'Super Admin',
        'admin@admin.com',
        -- This is a placeholder hash. In production, use proper password hashing
        'AQAAAAEAACcQAAAAELbXp1QrH3jJz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Q=='
    )
END
ELSE
BEGIN
    -- Update existing admin user's password
    UPDATE Admin 
    SET PasswordHash = 'AQAAAAEAACcQAAAAELbXp1QrH3jJz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Qz7Q=='
    WHERE Email = 'admin@admin.com'
END

-- Verify the admin user was created/updated
SELECT * FROM Admin WHERE Email = 'admin@admin.com' 