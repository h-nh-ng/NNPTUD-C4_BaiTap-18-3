var express = require('express');
var router = express.Router();
const sql = require('mssql');

/* GET ALL ROLES */
router.get('/', async function (req, res) {
  try {

    const result = await sql.query`SELECT * FROM Roles`;

    res.json(result.recordset);

  } catch (error) {

    res.status(500).json({
      message: 'SERVER ERROR',
      error: error.message
    });

  }
});

/* GET ROLE BY ID */
router.get('/:id', async function (req, res) {

  const id = req.params.id;

  try {

    const result = await sql.query`
      SELECT * FROM Roles WHERE id = ${id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'ROLE NOT FOUND'
      });
    }

    res.json(result.recordset[0]);

  } catch (error) {

    res.status(500).json({
      message: 'SERVER ERROR',
      error: error.message
    });

  }
});

/* CREATE ROLE */
router.post('/', async function (req, res) {

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: 'name is required'
    });
  }

  try {

    await sql.query`
      INSERT INTO Roles(name, description)
      VALUES(${name}, ${description || ''})
    `;

    res.status(201).json({
      message: 'ROLE CREATED'
    });

  } catch (error) {

    res.status(500).json({
      message: 'SERVER ERROR',
      error: error.message
    });

  }
});

/* UPDATE ROLE */
router.put('/:id', async function (req, res) {

  const id = req.params.id;
  const { name, description } = req.body;

  try {

    const result = await sql.query`
      UPDATE Roles
      SET name = ${name}, description = ${description}
      WHERE id = ${id}
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: 'ROLE NOT FOUND'
      });
    }

    res.json({
      message: 'ROLE UPDATED'
    });

  } catch (error) {

    res.status(500).json({
      message: 'SERVER ERROR',
      error: error.message
    });

  }
});

/* DELETE ROLE */
router.delete('/:id', async function (req, res) {

  const id = req.params.id;

  try {

    const result = await sql.query`
      DELETE FROM Roles
      WHERE id = ${id}
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: 'ROLE NOT FOUND'
      });
    }

    res.json({
      message: 'ROLE DELETED'
    });

  } catch (error) {

    res.status(500).json({
      message: 'SERVER ERROR',
      error: error.message
    });

  }
});

module.exports = router;