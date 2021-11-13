const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");
const mailSender = require("../../../utils/mailer");
let SecModelClass = require('./sec.model.js');
let SecModel = new SecModelClass();


var uuid = require('uuid');
uuid.v4(); //identificador unico
var tempEmail=null;


router.post('/login', async (req, res, next)=>{
  try {
    
    const {email, pswd} = req.body;

    //console.log({email,pswd});
    //Validar los datos
    let userLogged = await SecModel.getByEmail(email);
    if (userLogged) {
      const isPswdOk = await SecModel.comparePassword(pswd, userLogged.password);
      if (isPswdOk) {
        // podemos validar la vigencia de la contraseña
        delete userLogged.password;
        delete userLogged.oldpasswords;
        delete userLogged.lastlogin;
        delete userLogged.lastpasswordchange;
        delete userLogged.passwordexpires;
        let payload = {
          jwt: jwt.sign(
            {
              email: userLogged.email,
              _id: userLogged._id,
              roles: userLogged.roles
            },
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
          ),
          user: userLogged
        };
        return res.status(200).json(payload);
      }
    }
    console.log({email, userLogged});
    return res.status(400).json({msg: "Credenciales no son Válidas"});
  }catch (ex){
    console.log(ex);
    res.status(500).json({"msg":"Error"});
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const {email, pswd} = req.body;

    let userAdded = await SecModel.createNewUser(email, pswd);
    delete userAdded.password;
    console.log(userAdded);
    res.status(200).json({"msg":"Usuario Creado Satisfactoriamente"});
  } catch (ex) {
    res.status(500).json({ "msg": "Error" });
  }
});


router.post('/passrecovery', async (req, res, next)=>{

  const {email}= req.body;

  const token = uuid.v4();

  let  enviar = await SecModel.sendTempToken(email, token);
  
  if(enviar){
  
    mailSender(
      email,
      "Test de envio de correo",
      token
    );
    res.status(200).json({msg:"Email Sent!!!"});
      tempEmail=email;
  }
  

  /*
  mailSender(
    email,
    "Test de envio de correo",
    "Esto es una prueba de correo"
  );
  res.status(200).json({msg:"Email Sent!!!"});
  */


});


router.post('/recovery', async (req, res, next)=>{

  const { token, newpass, email } = req.body;

  let temp = await SecModel.getByEmailToken(email);

  if(temp){
    
    res.status(200).json({ "msg": temp.tempTok });
    console.log("Usuario encontrado");
    console.log(temp.tempTok);
    console.log(temp.expTok);

    
    let tokenOK = await SecModel.compareToken(token, temp.tempTok, temp.expTok);

    if(tokenOK){
      
      let user = await SecModel.getByEmail(email);

      if (user) {

        //const passArray = user.oldpasswords.concat(user.password);

        const passArray = new Array();

        let updatePass = await SecModel.updatePass(user._id, newpass);
  
        if(updatePass){
    
          res.status(200).json({ "msg": "Contraseña Actualizada" });
        
        }

      }

    }else{
      console.log("Token incorrecto/expirado");
    }
    
  }

});

module.exports = router;


