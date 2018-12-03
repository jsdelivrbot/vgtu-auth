var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var user = require('../mongo/schema')
var CryptoJS = require("crypto-js");
var math = require('mathjs')
var logger = require('../logger')



router.get('/', function(req, res, next) {
  if (req.cookies['sessionVGTU']) {
	  user
	  	.findOne({cookie: req.cookies['sessionVGTU']})
	  	.then(doc => {
	  		if (doc.length != 0) {
	  			logger.info('User', doc.email, 'logged using cookie')
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
	  		logger.info('User', doc.email, 'logged out')
	  		res.clearCookie('sessionVGTU');
  			doc.cookie = ""
  			doc.save(function(err, res) {
  				if (err)
  					logger.error('User', doc.email, 'COOKIE removal failed')
  				else
  					logger.info('User', doc.email, 'deleted cookie')
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
		  res.render('index', {message: "user not found"})
  		}
  	})
});


router.get('/chall/:no/:id', function(req, res, next) {
  user
  	.findOne({_id: req.params.id})
  	.then(doc => {

  		if (req.params.no == 4) {
    		var randomNumber=Math.random().toString();
    		randomNumber=randomNumber.substring(2,randomNumber.length);
    		res.cookie('sessionVGTU',randomNumber, { maxAge: 900000, httpOnly: true });  			
  			doc.cookie = randomNumber
  			doc.save(function(err, res) {
  				if (err)
  					logger.error('User', doc.email, 'COOKIE save error')
  				else
  					logger.info('User', doc.email, 'created cookie')

  			})
  			logger.info('User', doc.email, 'logged in using challenges')
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
  				logger.error('User', doc.email, 'challenge error')
  		});
  		if (doc.length != 0) {
  			res.render('challenge', {number: req.params.no, a:a, b:b, c:c, d:d, e:e, url:'/chall/' + req.params.no + '/' + req.params.id })
  		} else {
		  res.render('index', {message: "user not found"})
  		}
  		logger.info('User', doc.email, 'generated new challenge')
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
			console.log(req.params.no + "MERCI" + req.body.res + "//" + result + '(expected)')
			if (req.body.res == result) {
				logger.info('User', doc.email, 'succedeed challenge' , req.params.no , '/3')
				res.redirect('/chall/' + num + '/' + req.params.id);
			} else {
				logger.info('User', doc.email, 'failed challenge' , req.params.no , '/3')
				res.redirect('/chall/1/' + req.params.id)
			}
		} catch (err) {
		    logger.error('User', doc.email, 'wrong formula')
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
		    logger.info('User', doc.email, 'Registered with wrong formula')
		    return res.render('register', {message: "Wrong formula! (only digits and +-/*)"})
		}
		  let msg = new user({
		    email: req.body.email,
		    password: req.body.formula,
		  })
		  msg.save()
			   .then(doc => {
			     logger.info('User', doc.email, 'created')
				
			   })
			   .catch(err => {
			   	logger.error('User', doc.email, 'failed to register')
			   })
		  res.render('index', {message: "Account created"})
  		}
  	})
});

router.get('/profile', function(req, res, next) {
  if (req.cookies['sessionVGTU']) {
	  user
	  	.findOne({cookie: req.cookies['sessionVGTU']})
	  	.then(doc => {
	  		if (doc.length != 0) {
	  			res.render('profile', {name:doc.name, email: doc.email});
	  		} else {
			  res.render('index', {message: "HACKER D3t3ct3d"})
			}
	  	})
  } else{
  	res.redirect('/')
  }
})

module.exports = router;
