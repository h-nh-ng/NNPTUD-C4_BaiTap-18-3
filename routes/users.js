
const express = require('express');
const router = express.Router();
const sql = require('mssql');

/* =========================
   GET ALL USERS
========================= */

router.get('/', async (req, res) => {
  try {

    const result = await sql.query(`
      SELECT 
        u.*, 
        r.name AS roleName,
        r.description AS roleDescription
      FROM Users u
      LEFT JOIN Roles r ON u.roleId = r.id
    `);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({
      message: "SERVER ERROR",
      error: err.message
    });
  }
});

/* =========================
   GET USER BY ID
========================= */

router.get('/:id', async (req, res) => {

  const id = req.params.id;

  try {

    const result = await sql.query(`
      SELECT 
        u.*, 
        r.name AS roleName,
        r.description AS roleDescription
      FROM Users u
      LEFT JOIN Roles r ON u.roleId = r.id
      WHERE u.id = ${id}
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "USER NOT FOUND"
      });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({
      message: "SERVER ERROR",
      error: err.message
    });
  }
});

/* =========================
   CREATE USER
========================= */

router.post('/', async (req, res) => {

  const {
    username,
    password,
    email,
    fullName,
    avatarUrl,
    status,
    roleId,
    loginCount
  } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      message: "username, password, email are required"
    });
  }

  try {

    await sql.query(`
      INSERT INTO Users
      (username,password,email,fullName,avatarUrl,status,roleId,loginCount)
      VALUES
      (
        '${username}',
        '${password}',
        '${email}',
        '${fullName || ""}',
        '${avatarUrl || "https://i.sstatic.net/l60Hf.png"}',
        ${status ? 1 : 0},
        ${roleId || "NULL"},
        ${loginCount || 0}
      )
    `);

    res.status(201).json({
      message: "USER CREATED"
    });

  } catch (err) {

    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({
        message: "USERNAME OR EMAIL ALREADY EXISTS"
      });
    }

    res.status(500).json({
      message: "SERVER ERROR",
      error: err.message
    });
  }
});

/* =========================
   UPDATE USER
========================= */

router.put('/:id', async (req, res) => {

  const id = req.params.id;

  const {
    username,
    password,
    email,
    fullName,
    avatarUrl,
    status,
    roleId,
    loginCount
  } = req.body;

  try {

    await sql.query(`
      UPDATE Users
      SET
        username='${username}',
        password='${password}',
        email='${email}',
        fullName='${fullName}',
        avatarUrl='${avatarUrl}',
        status=${status ? 1 : 0},
        roleId=${roleId || "NULL"},
        loginCount=${loginCount || 0}
      WHERE id=${id}
    `);

    res.json({
      message: "USER UPDATED"
    });

  } catch (err) {
    res.status(500).json({
      message: "SERVER ERROR",
      error: err.message
    });
  }
});

/* =========================
   DELETE USER
========================= */

router.delete('/:id', async (req, res) => {

  const id = req.params.id;

  try {

    await sql.query(`
      DELETE FROM Users
      WHERE id=${id}
    `);

    res.json({
      message: "USER DELETED"
    });

  } catch (err) {
    res.status(500).json({
      message: "SERVER ERROR",
      error: err.message
    });
  }
});

module.exports = router;