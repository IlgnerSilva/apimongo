const bcrypt = require('bcryptjs');

module.exports = class TrataUsuario{
    constructor(body){
        this.nome = body.nome;
        this.email = body.email;
        this.senha = this.encrypt(body.senha);
    }
    encrypt(senha){
        const hash = bcrypt.hashSync(senha);
        return hash;
    }
}

