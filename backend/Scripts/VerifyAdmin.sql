-- Check if Admin table exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
BEGIN
    -- Show all admin users
    SELECT Id, Email, Role, CreatedAt, UpdatedAt 
    FROM Admin;

    -- Specifically check super admin
    SELECT Id, Email, Role, PasswordHash, CreatedAt, UpdatedAt 
    FROM Admin 
    WHERE Email = 'superadmin@vcqru.com';
END
ELSE
BEGIN
    PRINT 'Admin table does not exist!';
END 