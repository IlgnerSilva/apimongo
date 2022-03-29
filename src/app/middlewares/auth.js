const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json')

module.exports = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).send({error: 'Token não informado'});

    // o token ele é separado por duas partes (Bearer) (dskajrfw98qhfwqfbwqniwenvciwoqhvoiwh)
    const separa = authHeader.split(' ');
    
    if(!separa.length === 2)
        return res.status(401).send({error: 'Token error'})

    const [scheme, token] = separa;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({error: 'Token formato inválido'})

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) return res.status(401).send({error: 'Token inválido'});
        req.userId = decoded.param.id
        return next()
    })
}