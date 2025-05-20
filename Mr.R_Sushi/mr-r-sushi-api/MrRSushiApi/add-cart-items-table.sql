CREATE TABLE IF NOT EXISTS "CartItems" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_CartItems" PRIMARY KEY AUTOINCREMENT,
    "MenuItemId" INTEGER NOT NULL,
    "SessionId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT "FK_CartItems_MenuItems_MenuItemId" FOREIGN KEY ("MenuItemId") REFERENCES "MenuItems" ("Id") ON DELETE CASCADE
); 