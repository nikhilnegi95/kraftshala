const express = require('express')
const bcrypt = require('bcryptjs')
const conn = require('../../config/conn')
const passport = require('passport')
const multer  = require('multer')
const router = express.Router()

const upload = multer({ dest: 'uploads/' })

router.get('/register', (req, res) => {
	res.render('instructorRegister')
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
		res.render('instructorRegister', {
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
				res.render('instructorRegister', {errors})
				return false
			}
			if(rows.length !== 0){
				errors.push({msg: 'email already exist'})
				res.render('instructorRegister', {errors})
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
					conn.query(`INSERT INTO user (name, email, password, subject, login_as) values ('${name}', '${email}', '${hashPassword}', '${subject}', 'instructor')`,function(err,rows){
						if(err){
							errors.push({msg: 'unable to register. pls try after some time'})
							res.render('instructorRegister', {errors})
							return false
						}
						else{
							req.flash('success_msg', 'register successfully, pls login')
							res.redirect('/instructor/login')
						}

					})
				}))
			}
		})
	}
})

router.get('/login', (req, res) => {
	if(req.session.user === undefined){
		res.render('instructorLogin')	
	}
	else {
		res.redirect('/dashboard')
	}
})

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect : '/dashboard',
		failureRedirect : '/instructor/login',
		failureFlash : true
	})(req, res, next)
})

router.post('/assignment', upload.single('question'), (req, res) => {
	const {name, subject, deadline} = req.body
	const question = req.file.path
	let errors = []

	if(req.file.mimetype !== 'application/pdf' || req.file.size > 10000000 ){
		errors.push({msg: 'type of file should be pdf and size less than 10mb'})
		res.render('instructorDashboard', {errors})
		return false
	}
	
	conn.query(`INSERT INTO assignment (user_id ,name, subject, question, deadline) values (${req.user.id}, '${name}', '${subject}', '${question}', '${deadline}')`,function(err,rows){
		if(err){
			console.log(err)
			errors.push({msg: 'unable to add assignment. pls try after some time'})
			res.render('instructorDashboard', {errors})
			return false
		}
		else{
			req.flash('success_msg', 'assignment added successfully.')
			res.redirect('/dashboard')
		}
	})

})

router.get('/submission', (req, res) => {
	let errors = []

	conn.query(`select *,user.name , assignment.name as ass_name, assignment.deadline from answer LEFT JOIN user on answer.user_id=user.id LEFT JOIN assignment on answer.assignment_id = assignment.id order by deadline desc`, function(err, rows) {
		if(err){
			console.log(err)
			errors.push({msg: 'unable to display data. pls try after some time'})
			res.render('instructorDashboard', {errors})
			return false
		}
		else {
			res.render('instructorSubmission', {data:rows})
		}
	})
})

router.get('/show/:id', (req, res) => {
	let errors = []
	const ass_id = req.params.id

	conn.query(`select answer.id, answer.answer, answer.grade, assignment.question from answer LEFT JOIN assignment on answer.assignment_id = assignment.id where assignment.id=${ass_id} order by deadline desc`, function(err, rows) {
		if(err){
			console.log(err)
			errors.push({msg: 'unable to display data. pls try after some time'})
			res.render('instructorSubmission', {errors})
			return false
		}
		else {
			res.render('instructorShow', {data:rows})
		}
	})	
})

router.post('/grade', (req, res) => {
	const answer = req.body.assignment_id
	const grade = req.body.grade
	let errors = []
	
	conn.query(`update answer set grade='${grade}' where id=${answer}`, function(err, rows) {
		if(err){
			console.log(err)
			errors.push({msg: 'unable to add grade. pls try after some time'})
			res.render('instructorShow', {errors})
			return false
		}
		else {
			res.redirect('/instructor/submission')
		}
	})
})

router.get('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/instructor/login')
})

module.exports = router