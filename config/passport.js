const Localstrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const conn = require('./conn')

//load user model
// const User = require('../models/user')

module.exports = function(passport) {
	let errors = []
	passport.use(
		new Localstrategy({usernameField: 'email', passwordField:'password', passReqToCallback : true}, (req, email, password, done) => {
			//match user

			conn.query(`select * from user where email='${email}'`,function(err,rows){
				if(err) {
					console.log(err)
					return done(err)
				}

				if (!rows.length) {
                	return done(null, false, req.flash('error_msg', 'No user found.'));
            	}
            	if(req.originalUrl == '/student/login' && rows[0].login_as != 'student'){
            		return done(null, false, req.flash('error_msg', 'Not authenticate for this url.'));	
            	}
            	else if(req.originalUrl == '/instructor/login' && rows[0].login_as != 'instructor'){
            		return done(null, false, req.flash('error_msg', 'Not authenticate for this url.'));	
            	}

				//match password
				bcrypt.compare(password, rows[0].password, (err, isMatch) => {
					if(err)
						console.log(err)

					if(isMatch) {
						return done(null, rows[0])
					}
					else {
						return done(null, false, req.flash('error_msg', 'Oops! Wrong password.'))
					}
				})
			})
		})
	)

	passport.serializeUser((user, done) => {
		done(null, user.id)
	})
	
	passport.deserializeUser((id, done) => {
		conn.query("select * from user where id = "+id,function(err,rows){	
			done(err, rows[0]);
		});
	})
}