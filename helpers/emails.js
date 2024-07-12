import nodemailer from 'nodemailer';// dependencia de express para enviar correos electronicos

// Configurar el transportador de Nodemailer.  Es para iniciar sesion y luego con senMail() poder mandar los correos a los datos pasados 
const emailRegistro = async (datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    const {email, nombre, token} = datos;

    // Enviar email
    await transport.sendMail({
        from: 'BienesRaices.com', // El remitente del correo.
        to:email, // El destinatario del correo (correo electrónico del usuario).
        subject: 'Confirma tu cuenta en BienesRaices.com', //  El asunto del correo.
        text: 'Confirma tu cuenta en BienesRaices.com', // El contenido en texto plano del correo.
        html: `<p>Hola ${nombre}, comprueba tu cuenta en bienesRaices.com</p>
        
            <p>Tu cuenta ya está lista, solo debes confirmar tu password en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `// El contenido en HTML del correo.
    })
};


const emailOlvidePassword = async (datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    const {email, nombre, token} = datos;

    // Enviar email
    await transport.sendMail({
        from: 'BienesRaices.com', // El remitente del correo.
        to:email, // El destinatario del correo (correo electrónico del usuario).
        subject: 'Reestablece tu password en BienesRaices.com', //  El asunto del correo.
        text: 'Reestablece tu password en BienesRaices.com', // El contenido en texto plano del correo.
        html: `<p>Hola ${nombre}, has solicitado restablecer tu password en bienesRaices.com</p>
        
            <p>Sigue el siguiente elnace para generar un password nuevo:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer password</a></p>

            <p>Si tu no solicitaste el camnio de password, puedes ignorar este mensaje</p>
        `// El contenido en HTML del correo.
    })
};

export {
    emailRegistro,
    emailOlvidePassword
}
