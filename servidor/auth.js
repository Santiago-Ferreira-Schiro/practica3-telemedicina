
var jwt = require("jwt-simple");
var clave = "miSecretoMasOscuro";

module.exports = function (req, res, next) {
    var token = req.query.token;

    if (!token) {
        return res.status(401).json("No se ha encontrado token");
    }

    var contenidoToken;

    try {
        contenidoToken = jwt.decode(token, clave);
    } catch (error) {
        return res.status(401).json("El token es incorrecto");
    }

    if (
        !contenidoToken ||
        !contenidoToken.expira ||
        !contenidoToken.usuario
    ) {
        return res.status(401).json("El formato del token no es adecuado");
    }

    if (contenidoToken.expira < Date.now()) {
        return res.status(401).json("El token ha expirado");
    }

    req.usuario = contenidoToken.usuario;

    next();
};
