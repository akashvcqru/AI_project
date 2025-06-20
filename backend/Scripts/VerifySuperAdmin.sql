-- Verify super admin exists
SELECT 
    Id,
    Email,
    IsSuperAdmin,
    CreatedAt,
    UpdatedAt
FROM Admin
WHERE Email = 'superadmin@vcqru.com';

-- If not exists, create it
IF NOT EXISTS (SELECT 1 FROM Admin WHERE Email = 'superadmin@vcqru.com')
BEGIN
    INSERT INTO Admin (Email, PasswordHash, IsSuperAdmin, CreatedAt, UpdatedAt)
    VALUES (
        'superadmin@vcqru.com',
        '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        1,
        GETUTCDATE(),
        GETUTCDATE()
    );
    
    PRINT 'Super admin account created successfully';
END
ELSE
BEGIN
    -- Update password hash if needed
    UPDATE Admin 
    SET PasswordHash = '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        IsSuperAdmin = 1,
        UpdatedAt = GETUTCDATE()
    WHERE Email = 'superadmin@vcqru.com';
    
    PRINT 'Super admin account updated successfully';
END

-- Print credentials
PRINT 'Super Admin Credentials:';
PRINT 'Email: superadmin@vcqru.com';
PRINT 'Password: VCQRU@2024'; 