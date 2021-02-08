const express = require('express')
const bcrypt = require('bcryptjs')
const conn = require('../../config/conn')
const passport = require('passport')
const http = require('http');
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const router = express.Router()

router.get('/register', (req, res) => {
	res.render('studentRegister')
})

router.post('/register', (req, res) => {
	const {name, email, password, password2, subject} = req.body
	let errors = []

	//check required fields
	if(!name || !email || !password || !password2 || !subject) {
		errors.push({msg: 'pls fill all the fields'})
	}

	//check password
	if(password !== password2) {
		errors.push({msg: 'password do not match'})		
	}

	//check pass length
	if(password.length < 6) {
		errors.push({msg: 'password should be atleast 6 character'})
	}

	if(errors.length > 0) {
		res.render('studentRegister', {
			errors,
			name,
			email,
			password,
			password2,
			subject
		})
	}
	else {
		//pass
		conn.query(`select * from user where email='${email}'`,function(err,rows){
			if(err) {
				errors.push({msg: 'unable to register. pls try after some time'})
				res.render('studentRegister', {errors})
				return false
			}
			if(rows.length !== 0){
				errors.push({msg: 'email already exist'})
				res.render('studentRegister', {errors})
				return false
			}
			else {
				//hash password
				bcrypt.genSalt(10, (err, salt) => 
					bcrypt.hash(password, salt, (err, hash) => {
					if(err)
						console.log(err)

					//set hashed password
					var hashPassword = hash

					//save user
					conn.query(`INSERT INTO user (name, email, password, subject, login_as) values ('${name}', '${email}', '${hashPassword}', '${subject}', 'student')`,function(err,rows){
						if(err){
							errors.push({msg: 'unable to register. pls try after some time'})
							res.render('studentRegister', {errors})
							return false
						}
						else{
							req.flash('success_msg', 'register successfully, pls login')
							res.redirect('/student/login')
						}

					})
				}))
			}
		})
	}
})

router.get('/login', (req, res) => {
	if(req.session.user === undefined){
		res.render('studentLogin')
	}
	else {
		res.redirect('/student/dashboard')
	}
})

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect : '/student/dashboard',
		failureRedirect : '/student/login',
		failureFlash : true
	})(req, res, next)
})

router.get('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/student/login')
})

router.get('/file/uploads/:file', (req, res) => {
	const file = `./uploads/${req.params.file}`;
	res.download(file)
})

router.post('/upload/answer', upload.single('answer'), (req, res) => {
	const answer = req.file.path
	const ass_id = req.body.assignment_id
	let errors = []

	if(req.file.mimetype !== 'application/pdf' || req.file.size > 10000000 ){
		errors.push({msg: 'type of file should be pdf and size less than 10mb'})
		res.render('studentDashboard', {errors})
		return false
	}

	conn.query(`INSERT INTO answer (user_id ,assignment_id, answer) values (${req.user.id}, '${ass_id}', '${answer}')`,function(err,rows){
		if(err){
			console.log(err)
			errors.push({msg: 'unable to add answer. pls try after some time'})
			res.render('studentDashboard', {errors})
			return false
		}
		else{
			req.flash('success_msg', 'answer added successfully.')
			res.redirect('/student/dashboard')
		}
	})
})

router.get('/submission', (req, res) => {
	let errors = []

	conn.query(`select * from answer LEFT JOIN assignment on answer.assignment_id=assignment.id where answer.user_id=${req.user.id}`, function(err, rows) {
		if(err){
			console.log(err)
			errors.push({msg: 'unable to display data. pls try after some time'})
			res.render('studentDashboard', {errors})
			return false
		}
		else {
			res.render('studentSubmission', {list:rows})
		}
	})	
})

module.exports = router