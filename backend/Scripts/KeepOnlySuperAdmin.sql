-- Remove regular admin user
DELETE FROM Admin WHERE Email = 'admin@admin.com';

-- Verify only super admin exists
SELECT 
    Id,
    Email,
    IsSuperAdmin,
    CreatedAt,
    UpdatedAt
FROM Admin
WHERE Email = 'superadmin@vcqru.com';

-- Print super admin credentials
PRINT 'Super Admin Login Credentials:';
PRINT 'Email: superadmin@vcqru.com';
PRINT 'Password: VCQRU@2024';
PRINT 'IsSuperAdmin: Yes'; 