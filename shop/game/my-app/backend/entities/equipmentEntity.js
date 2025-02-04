const db = require("../db");
const { sanitizeInput } = require("../utils/auth");

exports.getUserInventory = async (userId) => {
    const sanitizedUserId = sanitizeInput(userId);

    const query = `
        SELECT gi.*, pi.quantity 
        FROM PLAYER_INVENTORY pi
        JOIN GAME_ITEMS gi ON pi.item_id = gi.id
        LEFT JOIN EQUIPMENT eq ON pi.user_id = eq.user_id AND pi.item_id = eq.item_id
        WHERE pi.user_id = ? AND eq.item_id IS NULL`;

    const capacityQuery = `SELECT capacity FROM USERS WHERE id = ? LIMIT 1`;

    try {
        const [inventory] = await db.execute(query, [sanitizedUserId]);
        const [capacityResult] = await db.execute(capacityQuery, [sanitizedUserId]);

        return {
            inventory,
            capacity: capacityResult.length > 0 ? capacityResult[0].capacity : 20,
        };
    } catch (error) {
        console.error("Error fetching user inventory:", error);
        throw error;
    }
};


exports.getEquippedItems = async (userId) => {
    const sanitizedUserId = sanitizeInput(userId);

    const query = `
        SELECT eq.slot, gi.*  -- Select all columns from GAME_ITEMS
        FROM EQUIPMENT eq 
        JOIN GAME_ITEMS gi ON eq.item_id = gi.id 
        WHERE eq.user_id = ?`;

    try {
        const [equipped] = await db.execute(query, [sanitizedUserId]);

        const equippedItems = {};
        equipped.forEach((item) => {
            equippedItems[item.slot] = item;
        });

        return equippedItems;
    } catch (error) {
        console.error("Error fetching equipped items:", error);
        throw error;
    }
};


exports.equipItem = async (userId, itemId, slot) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedItemId = sanitizeInput(itemId);
        const sanitizedSlot = sanitizeInput(slot);

        // Check if the user has enough quantity to equip
        const checkInventoryQuery = "SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?";
        const [inventory] = await connection.execute(checkInventoryQuery, [sanitizedUserId, sanitizedItemId]);

        if (inventory.length === 0 || inventory[0].quantity < 1) {
            throw new Error("You do not own this item or it is out of stock.");
        }

        // Check if the slot is already occupied
        const checkSlotQuery = "SELECT id FROM EQUIPMENT WHERE user_id = ? AND slot = ?";
        const [existingItem] = await connection.execute(checkSlotQuery, [sanitizedUserId, sanitizedSlot]);

        if (existingItem.length > 0) {
            throw new Error("Slot already occupied. Unequip first.");
        }

        // Insert new equipment
        const insertEquipmentQuery = `
            INSERT INTO EQUIPMENT (user_id, item_id, slot) 
            VALUES (?, ?, ?)`;
        await connection.execute(insertEquipmentQuery, [sanitizedUserId, sanitizedItemId, sanitizedSlot]);

        // Reduce item quantity in inventory
        await connection.execute(
            `UPDATE PLAYER_INVENTORY SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?`,
            [sanitizedUserId, sanitizedItemId]
        );

        // Remove item from inventory if quantity reaches 0
        await connection.execute(
            `DELETE FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ? AND quantity <= 0`,
            [sanitizedUserId, sanitizedItemId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Error equipping item:", error);
        throw error;
    } finally {
        connection.release();
    }
};


exports.unequipItem = async (userId, slot) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedSlot = sanitizeInput(slot);

        // Fetch item ID before removing it
        const [equippedItem] = await connection.execute(
            "SELECT item_id FROM EQUIPMENT WHERE user_id = ? AND slot = ?",
            [sanitizedUserId, sanitizedSlot]
        );

        if (equippedItem.length === 0) {
            throw new Error("No item found in this slot.");
        }

        const itemId = equippedItem[0].item_id;

        // Remove from EQUIPMENT table
        await connection.execute(
            "DELETE FROM EQUIPMENT WHERE user_id = ? AND slot = ?",
            [sanitizedUserId, sanitizedSlot]
        );

        // Check if item already exists in PLAYER_INVENTORY
        const [existingItem] = await connection.execute(
            "SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?",
            [sanitizedUserId, itemId]
        );

        if (existingItem.length > 0) {
            // Increase quantity if it exists
            await connection.execute(
                "UPDATE PLAYER_INVENTORY SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?",
                [sanitizedUserId, itemId]
            );
        } else {
            // Insert new row if it doesn’t exist
            await connection.execute(
                "INSERT INTO PLAYER_INVENTORY (user_id, item_id, quantity) VALUES (?, ?, 1)",
                [sanitizedUserId, itemId]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Error unequipping item:", error);
        throw error;
    } finally {
        connection.release();
    }
};



exports.sellItem = async (userId, itemId, price) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Ensure the user owns the item and check quantity
        const [inventory] = await connection.execute(
            `SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?`,
            [userId, itemId]
        );

        if (inventory.length === 0) {
            throw new Error("Item not found in inventory.");
        }

        const currentQuantity = inventory[0].quantity;

        if (currentQuantity > 1) {
            // If user owns more than 1, reduce the quantity by 1
            await connection.execute(
                `UPDATE PLAYER_INVENTORY SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?`,
                [userId, itemId]
            );
        } else {
            // If only 1 item left, remove it from inventory
            await connection.execute(
                `DELETE FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ? LIMIT 1`,
                [userId, itemId]
            );
        }

        // Add item's price to user's wallet
        await connection.execute(
            `UPDATE USERS SET wallet = wallet + ? WHERE id = ?`,
            [price, userId]
        );

        await connection.commit();
        return { success: true, message: "Item sold successfully.", newBalance: price };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
