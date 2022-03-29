const mongoose = require('../../database/connection');

const ModeloUsuario = mongoose.Schema({
    nome:{
        type: 'string',
        required: true
    },
    email:{
        type: 'string',
        unique: true,
        required: true,
        lowercase: true
    },
    senha:{
        type: 'string',
        required: true,
        select: false
    },
    resetSenhaToken:{
        type: 'string',
        select: true,
    },
    resetSenhaExpirar:{
        type: Date,
        select: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Usuarios = mongoose.model('Usuarios', ModeloUsuario);

module.exports = Usuarios;