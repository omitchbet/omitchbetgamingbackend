import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

export async function sendWelcomeMail(userEmail, firstName, lastName) {
  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./src/views"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/views"),
  };

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  var mailOptions = {
    from: '"CryptoCapitalInvest" <support@cryptocapitalinvest.co>', // sender address
    to: `${userEmail}`, // list of receivers
    subject: "Welcome to Crypto Capital Invest!",
    template: "welcomemail", // the name of the template file i.e email.handlebars
    context: {
      name: `${firstName} ${lastName}`, // replace {{name}} with Adebola
    },
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    console.log("Message sent");
  });
}

export async function sendMail(
  firstName,
  lastName,
  subject,
  message,
  userEmail
) {
  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./src/views"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/views"),
  };

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  var mailOptions = {
    from: '"CryptoCapitalInvest" <support@cryptocapitalinvest.co>', // sender address
    to: `${userEmail}`, // list of receivers
    subject: `${subject}`,
    template: "sendmail", // the name of the template file i.e email.handlebars
    context: {
      subject: `${subject}`,
      name: `${firstName} ${lastName}`, // replace {{name}} with Adebola
      message: `${message}`,
    },
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    console.log("Message sent");
  });
}
