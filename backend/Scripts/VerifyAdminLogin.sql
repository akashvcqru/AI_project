-- Verify Admin User and Password Hash
SELECT 
    Id,
    Email,
    PasswordHash,
    LEN(PasswordHash) as HashLength,
    IsSuperAdmin,
    CreatedAt,
    UpdatedAt
FROM Admin
WHERE Email = 'superadmin@vcqru.com';

-- Also check if the password hash matches what we expect
DECLARE @ExpectedHash NVARCHAR(MAX) = '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
DECLARE @StoredHash NVARCHAR(MAX);

SELECT @StoredHash = PasswordHash 
FROM Admin 
WHERE Email = 'superadmin@vcqru.com';

IF @StoredHash = @ExpectedHash
    PRINT 'Password hash matches expected value'
ELSE
    PRINT 'Password hash does not match expected value';

-- Print the actual stored hash for comparison
PRINT 'Stored hash: ' + ISNULL(@StoredHash, 'NULL');
PRINT 'Expected hash: ' + @ExpectedHash; 