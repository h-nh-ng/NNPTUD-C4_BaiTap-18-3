let sql = require('mssql');
let bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (username, password, email, roleId,
        fullName, avatarUrl, status, loginCount) {
        let hashedPassword = bcrypt.hashSync(password, 10);
        let result = await sql.query(`
            INSERT INTO Users (username, password, email, fullName, avatarUrl, status, roleId, loginCount)
            OUTPUT INSERTED.*
            VALUES (
                '${username}',
                '${hashedPassword}',
                '${email}',
                '${fullName || ""}',
                '${avatarUrl || "https://i.sstatic.net/l60Hf.png"}',
                ${status ? 1 : 0},
                ${roleId || "NULL"},
                ${loginCount || 0}
            )
        `);
        return result.recordset[0];
    },
    GetAnUserByUsername: async function (username) {
        let result = await sql.query(`
            SELECT * FROM Users WHERE username = '${username}'
        `);
        return result.recordset[0] || null;
    },
    GetAnUserById: async function (id) {
        let result = await sql.query(`
            SELECT * FROM Users WHERE id = ${id}
        `);
        return result.recordset[0] || null;
    },
    UpdateLoginCount: async function (id, loginCount) {
        await sql.query(`
            UPDATE Users SET loginCount = ${loginCount} WHERE id = ${id}
        `);
    },
    LockUser: async function (id, lockTime) {
        await sql.query(`
            UPDATE Users SET loginCount = 0, lockTime = '${new Date(lockTime).toISOString()}' WHERE id = ${id}
        `);
    },
    ChangePassword: async function (id, newPassword) {
        let hashedPassword = bcrypt.hashSync(newPassword, 10);
        await sql.query(`
            UPDATE Users SET password = '${hashedPassword}' WHERE id = ${id}
        `);
    }
};