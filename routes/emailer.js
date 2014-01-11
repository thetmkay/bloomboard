var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",  // sets automatically host, port and connection security settings
   auth: {
       user: "123leomak@gmail.com",
       pass: "yetifunk"
   }
});

exports.email = function (email) {
	smtpTransport.sendMail({  //email options
	   from: "Leo Mak <123leomak@gmail.com>", // sender address.  Must be the same as authenticated user if using Gmail.
	   to: email, // receiver
	   subject: "Emailing with nodemailer", // subject
	   text: "Welcome to Bloomboard!", // body
	   html: "<b>Hello world!</b>" // html body
	}, function(error, response){  //callback
	   if(error){
	       console.log(error);
	   }else{
	       console.log("Message sent: " + response.message);
	   }
	   
	   smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
	});
};
