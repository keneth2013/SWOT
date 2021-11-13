const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport(

    {
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    }

)



const mailSender = (to, subjet, body)=>{
    
    const mailOptions = {
        "from": 'process.env.MAIL_USER',
        "to" : to,
        "subjet": subjet,
        "text": body,
        //"html": body
    }

    mailTransport.sendMail( mailOptions, (err, info)=>{
        if (err) {
            console.log(err);
        }else{
            console.log(`Email Sent: ${info.response}`);
        }
    });

}


module.exports = mailSender;