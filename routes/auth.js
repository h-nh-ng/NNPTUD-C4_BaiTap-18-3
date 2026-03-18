let express = require('express');
let router = express.Router();
let userController = require('../controllers/users');
let bcrypt = require('bcrypt');
let fs = require('fs');
const { CheckLogin } = require('../utils/authHandler');
const { ChangePasswordValidator, validatedResult } = require('../utils/validator');
let jwt = require('jsonwebtoken');
let privateKey = fs.readFileSync(__dirname + '/../privateKey.pem');

router.post('/register', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        let newUser = await userController.CreateAnUser(username, password, email, null);
        res.send(newUser);
    } catch (error) {
        res.status(404).send({
            message: error.message
        });
    }
});

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await userController.GetAnUserByUsername(username);
        if (!user) {
            res.status(404).send({
                message: "thong tin dang nhap khong dung"
            });
            return;
        }
        if (user.lockTime && new Date(user.lockTime) > new Date()) {
            res.status(404).send({
                message: "ban dang bi ban"
            });
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {
            await userController.UpdateLoginCount(user.id, 0);
            let token = jwt.sign({
                id: user.id
            }, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1d'
            });
            res.send(token);
        } else {
            let newCount = (user.loginCount || 0) + 1;
            if (newCount >= 3) {
                await userController.LockUser(user.id, Date.now() + 3600 * 1000);
            } else {
                await userController.UpdateLoginCount(user.id, newCount);
            }
            res.status(404).send({
                message: "thong tin dang nhap khong dung"
            });
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        });
    }
});

router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        let user = req.user;

        if (!bcrypt.compareSync(oldpassword, user.password)) {
            return res.status(400).send({
                message: "mat khau cu khong dung"
            });
        }

        await userController.ChangePassword(user.id, newpassword);
        res.send({
            message: "doi mat khau thanh cong"
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user);
});

module.exports = router;