-- Pancake menu items

-- First, we'll check if the 'pancake' category exists in the Categories table
-- If not, we'll add it
IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'pancake')
BEGIN
    INSERT INTO Categories (Name)
    VALUES ('pancake');
END

-- Get the ID of the pancake category
DECLARE @PancakeCategoryId INT;
SELECT @PancakeCategoryId = Id FROM Categories WHERE Name = 'pancake';

-- Regular Pancakes
INSERT INTO MenuItems (Name, Description, Price, CategoryId, ImageUrl, Featured)
VALUES 
    ('杂粮煎饼', '单蛋 + 蔬菜 + 沙拉，健康美味', '7元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=60', 1);

-- Pancake Sets
INSERT INTO MenuItems (Name, Description, Price, CategoryId, ImageUrl, Featured)
VALUES 
    ('火鸡面煎饼', '双蛋 + 蔬菜 + 火鸡面，美味搭配', '12元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60', 0),
    ('海苔肉松煎饼', '双蛋 + 蔬菜 + 海苔 + 肉松，经典组合', '13元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=60', 0),
    ('培根煎饼', '双蛋 + 蔬菜 + 培根，西式风味', '14元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60', 0),
    ('中式汉堡煎饼', '双蛋 + 蔬菜 + 肉松 + 火腿肉，创意十足', '16元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=60', 0);

-- Special Fire Cheese Series
INSERT INTO MenuItems (Name, Description, Price, CategoryId, ImageUrl, Featured)
VALUES 
    ('火焰芝士火鸡面煎饼', '双蛋 + 芝士 + 蔬菜 + 火鸡面，豪华美味', '22元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1598215439219-738c1b65700a?w=800&auto=format&fit=crop&q=60', 1),
    ('火焰芝士海苔肉松煎饼', '双蛋 + 芝士 + 蔬菜 + 海苔 + 肉松，多层风味', '23元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1567982047351-76b6f93e88ee?w=800&auto=format&fit=crop&q=60', 0),
    ('火焰芝士培根煎饼', '双蛋 + 芝士 + 蔬菜 + 培根，口感丰富', '24元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60', 1),
    ('火焰芝士火腿煎饼', '双蛋 + 芝士 + 蔬菜 + 肉松 + 火腿肉，奢华体验', '26元', @PancakeCategoryId, 'https://images.unsplash.com/photo-1563381013529-1c922c80ac8d?w=800&auto=format&fit=crop&q=60', 0);

-- Companions Table (optional - if you want to formalize the available companions)
-- This could be used by the API to provide valid companion options
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PancakeCompanions')
BEGIN
    CREATE TABLE PancakeCompanions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL,
        Price DECIMAL(5,2) NOT NULL
    );

    INSERT INTO PancakeCompanions (Name, Price)
    VALUES 
        ('加海苔', 3.00),
        ('加肉松', 4.00),
        ('加火腿肉', 6.00),
        ('加培根', 7.00);
END 