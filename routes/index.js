var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var user = require('../mongo/schema')
var CryptoJS = require("crypto-js");
var math = require('mathjs')
var logger = require('../logger')
const nodemailer = require('nodemailer');



router.get('/', function(req, res, next) {
	logger.info({ip: req.ip, type: "get_home", country:req.fingerprint.components.geoip.country, browser:req.fingerprint.components.useragent.browser.family, lang:req.fingerprint.components.acceptHeaders.language, os:req.fingerprint.components.useragent.os.family })
  if (req.cookies['sessionVGTU']) {
	  user
	  	.findOne({cookie: req.cookies['sessionVGTU']})
	  	.then(doc => {
	  		if (doc.length != 0) {
	  			logger.info({ip: req.ip, type: "login_cookie", user: doc.email })
	  			res.redirect('/profile')
	  		} else {
			  res.render('index', {message: "HACKER D3t3ct3d"})
	  		}
	  	})
  } else{
  	res.render('index', { title: 'Express' });
  }
});



router.get('/logout', function(req, res, next) {
  if (req.cookies['sessionVGTU']) {
	  user
	  	.findOne({cookie: req.cookies['sessionVGTU']})
	  	.then(doc => {
	  		if (doc.length != 0) {
	  		logger.info({ip: req.ip, type: "logout", user: doc.email })
	  		res.clearCookie('sessionVGTU');
  			doc.cookie = ""
  			doc.save(function(err, res) {
  				if (err)
				logger.info({ip: req.ip, type: "cookie_removal_failed", user: doc.email })
 
  				else
					logger.info({ip: req.ip, type: "del_cookie", user: doc.email })

  			})
	  		res.redirect('/');
	  		} else {
			  res.redirect('/');
			}
	  	})
  } else{
  	res.redirect('/')
  } 

});


router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});


router.post('/login', function(req, res, next) {
  user
  	.find({email: req.body.email})
  	.then(doc => {
  		if (doc.length != 0) {
  			res.redirect('/chall/1/' + doc[0]._id)

  		} else {

		logger.info({ip: req.ip, type: "connect_fail", user: req.body.email })
		  res.render('index', {message: "user not found"})
  		}
  	})
});


router.get('/chall/:no/:id', function(req, res, next) {
  user
  	.findOne({_id: req.params.id})
  	.then(doc => {

  		if (req.params.no == 4) {
		if (doc.hash != req.fingerprint.hash) {
			logger.info({ip: req.ip, type: "bad_fingerprint", info: doc.email})
			return (res.render('index', {message: "I dont trust you."}))
		}
    		var randomNumber=Math.random().toString();
    		randomNumber=randomNumber.substring(2,randomNumber.length);
    			res.cookie('sessionVGTU',randomNumber, {sameSite: true, 
			expires: new Date(Date.now() + 90000000), 
			secure: true, 
			httpOnly: true });  			
  			doc.cookie = randomNumber
  			doc.save(function(err, res) {
  				if (err)
					logger.info({ip: req.ip, type: "cookie_error", user: doc.email })

  				else
					logger.info({ip: req.ip, type: "new_cookie", user: doc.email })


  			})
			logger.info({ip: req.ip, type: "login_chall", user: doc.email })
  			return res.redirect('/profile')
  		}

  		let a = Math.floor(Math.random() * 10) + 1
  		let b = Math.floor(Math.random() * 10) + 1
  		let c = Math.floor(Math.random() * 10) + 1
  		let d = Math.floor(Math.random() * 10) + 1
  		let e = Math.floor(Math.random() * 10) + 1
  		doc.a = a
  		doc.b = b
  		doc.c = c
  		doc.d = d
  		doc.e = e
  		doc.save(function(err, res) {
  			if (err)
				logger.info({ip: req.ip, type: "chall_error", user: doc.email })

  		});
  		if (doc.length != 0) {
  			res.render('challenge', {number: req.params.no, a:a, b:b, c:c, d:d, e:e, url:'/chall/' + req.params.no + '/' + req.params.id })
  		} else {
		  res.render('index', {message: "user not found"})
  		}
		logger.info({ip: req.ip, type: "new_chall", user: doc.email })  	

  	})
});



router.post('/chall/:no/:id', function(req, res, next) {
	var result = 0
	var num = parseInt(req.params.no,10) + 1		
	user.findOne({_id: req.params.id}).then(doc => {
		var scope = {
			    a: doc.a,
			    b: doc.b,
			    c: doc.c,
			    d: doc.d,
			    e: doc.e
			}
		try {
			result = math.eval(doc.password, scope)
	
			if (req.body.res == result) {
				logger.info({ip: req.ip, type: "succeed_chall", user: doc.email , info:req.params.no})

				res.redirect('/chall/' + num + '/' + req.params.id);
			} else {

				logger.info({ip: req.ip, type: "failed_chall", user: doc.email, info:req.params.no })
				res.redirect('/chall/1/' + req.params.id)
			}
		} catch (err) {
		    logger.info({ip: req.ip, type: "wrong_formula", user: doc.email, info:doc.password })

		    res.render('index', {message: "Error during challenge"})
		}
	})
});

router.post('/regis', function(req, res, next) {
  user
  	.find({email: req.body.email})
  	.then(doc => {
  		if (doc.length != 0) {
  			return res.render('register', {message: "User already exists"})
  		} else {

		try {
			let scope = {
			    a: 1,
			    b: 1,
			    c: 1,
			    d: 1,
			    e: 1
			}
			math.eval(req.body.formula, scope)
		} catch (err) {
			logger.info({ip: req.ip, type: "regis_wrong_formula", user: doc.email, info:req.body.formula })
		    return res.render('register', {message: "Wrong formula! (only digits and +-/*)"})
		}
		  let msg = new user({
		    email: req.body.email,
		    password: req.body.formula,
			country: req.fingerprint.components.geoip.country,
			language: req.fingerprint.components.acceptHeaders.language,
			accept: req.fingerprint.components.acceptHeaders.accept,
			browser: req.fingerprint.components.useragent.browser,
			device: req.fingerprint.components.useragent.device,
			os: req.fingerprint.components.useragent.os,
			hash: req.fingerprint.hash  
		})
		console.log(msg)
		console.log(req.fingerprint.components.useragent)
		  msg.save()
			   .then(doc => {
				console.log("NEW USER =>", doc)
				logger.info({ip: req.ip, type: "new_user", user: doc.email })
				
	res.render('index', {message: "Account created"})			   
})
			   .catch(err => {
				logger.info({ip: req.ip, type: "regis_err", user: req.body.email })
			   	return (res.render('index', {message: "user already exists, sorry"}))
				})

  		}
  	})
});

router.get('/profile', function(req, res, next) {
  if (req.cookies['sessionVGTU']) {
	  user
	  	.findOne({cookie: req.cookies['sessionVGTU']})
	  	.then(doc => {
	  		if (doc.length != 0) {
	  			res.render('profile', {country: doc.country, language: doc.language, accept: doc.accept, browserfamily: doc.browser.family, browserv:doc.browser.version, devicefamily: doc.device.family, devicev:doc.device.version, osfamily:doc.os.family, hash:doc.hash, name:doc.name, email: doc.email});
	  		} else {
			  res.render('index', {message: "HACKER D3t3ct3d"})
			}
	  	})
  } else{
  	res.redirect('/')
  }

})

router.get('/resetPass', function(req, res,next) {
	res.render('forgot');
})

router.post('/forgotPass', function(req, res, next){
	user.findOne({email: req.body.email})
	.then(doc => {
		if (!doc){
			logger.info({ip:req.ip, type: "email_recover_not_found", user: req.body.email})
		} else {
			if (req.fingerprint.hash == doc.hash) {


var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'vgtuauth@gmail.com',
        pass: 'vgtuauth123'
    }
});

const mailOptions = {
  from: 'cia@example.com', // sender address
  to: req.body.email, // list of receivers
  subject: 'Argos.sh password recovery', // Subject line
html: '<p>Click on the following link to reset your passwd for argos</p><br><a href="http://argos.sh/reset/' + doc.hash + '">reset</a>'
};
transporter.sendMail(mailOptions, function (err, info) {
   if(err) {
     return res.redirect('/'); console.log("ERR");}
  else{
	logger.info({ip:req.ip, type:"email_sent", info:req.body.email}); console.log("SEND");}
});
			} else {
				logger.info({ip: req.ip, type:"recover_wrong_hash", user: req.body.email})
			}
		}
		res.render('index', {message: "Check your mailbox"})

	})
})

router.get('/reset/:id', function(req, res, next) {
	res.render('resetPass', {id: req.params.id});
});

router.post('/changePass', function(req, res, next){
	user.findOne({hash: req.body.id})
	.then(doc => {
		if (!doc) {
			return res.render('index', {message:"Error"})
		} else {


                try {
                        let scope = {
                            a: 1,
                            b: 1,
                            c: 1,
                            d: 1,
                            e: 1
                        }
                        math.eval(req.body.formula, scope)
                } catch (err) {
                        logger.info({ip: req.ip, type: "recover_wrong_formula", user: doc.email, info:req.body.formula })
                    return res.render('register', {message: "Wrong formula! (only digits and +-/*)"})
                }
		if (req.fingerprint.hash != doc.hash) {
			logger.info({ip: req.ip, type: "recover_bad_fingerprint", user:doc.email})
			return res.redirect('/')
		}
		doc.password = req.body.formula;
		doc.save(function(err, data) {
		if (err)
			console.log("ERROR")
		console.log(doc)
		res.redirect('/')
		})



			
		}
	})
	console.log(req.body)
});

router.get('*', function(req,res,next) {

logger.info({ip: req.ip, type: "get_undefined", info:req.url})
	res.status(200).send('not found')
//res.redirect('/');
})

module.exports = router;
