const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('./../models/ModeloUsuario');
const TrataUsuario = require('./../models/TrataUsuario');
const authConfig = require('../../config/auth.json');
const mailer = require('../../modules/mailer');

function geradorDeToken(param = {}) {
    return jwt.sign({ param }, authConfig.secret, {
        expiresIn: 86400
    });
};

router.post('/cadastrar', async (req, res) => {
    try {
        const { email } = req.body;
        if (await Usuario.findOne({ email })) {
            return res.status(400).send({
                error: 'Email já cadastrado'
            });
        };
        const User = new TrataUsuario(req.body);
        const usuario = await Usuario.create(User);

        usuario.senha = undefined
        return res.send({
            usuario,
            token: geradorDeToken(usuario.id)
        });

    } catch (err) {
        return res.status(400).send({ error: 'Não foi possível cadastrar seu usuario' });
    }
});

router.post('/logar', async (req, res) => {
    try{
        const { email, senha } = req.body;
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario){
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }
    
        if (!await bcrypt.compare(senha, usuario.senha)){
            return res.status(400).send({ error: 'Senha inválida' });
        };
        usuario.senha = undefined;
    
        res.send({
            message: 'Usuário logado',
            usuario,
            token: geradorDeToken({ id: usuario.id })
        });
    }catch(err){
        res.status(400).send({Erro: err})
    }
});

router.post('/esqueci_senha', async (req, res) => {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email })
        if (!usuario){
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const data = new Date();
        data.setHours(data.getHours() + 1);
        await Usuario.updateMany({id: usuario.id, email: usuario.email}, {
            '$set': {
                resetSenhaToken: token,
                resetSenhaExpirar: data
            }
        });

        mailer.sendMail({
            to: email,
            from: 'ilgnersilvapj@gmail.com',
            template: 'auth/esqueci_senha',
            context: { token }
        }, (err) => {
            if (err){
                return res.status(400).send({ error: 'Não consigo enviar email com senha esquecida' });
            };
            res.status(200).send('Abra seu email');
        });

    } catch (err) {
        res.status(400).send({ error: 'Erro na rota esqueciminhasenha' });
    }
});

router.post('/reset_senha', async (req, res) => {
    const { email, token, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email })
            .select('+resetSenhaToken resetSenhaExpirar');

        if (!usuario){
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        if (token !== usuario.resetSenhaToken){
            return res.status(400).send({ error: 'Token inválido' });
        }

        const data = new Date();

        if (data > usuario.resetSenhaExpirar){
            return res.status(400).send({ error: 'Token expirado, por favor gere um novo' });
        }
        usuario.senha = bcrypt.hashSync(senha);
        await usuario.save();
        res.send();

    } catch (err) {
        res.status(400).send({ Error: 'Não foi possivel redefinir senha, tente novamente' });
    }
});

module.exports = app => app.use('/auth', router);