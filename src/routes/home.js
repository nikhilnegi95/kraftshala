const express = require('express')
const router = express.Router()
const {ensureStudentAuthenticated, ensureAuthenticated} = require('../../config/auth')
const conn = require('../../config/conn')

router.get('/', (req, res) => {
	res.render('home')
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
	req.session.user = req.user
	res.render('instructorDashboard', req.user)
})

router.get('/student/dashboard', ensureStudentAuthenticated, (req, res) => {
	req.session.user = req.user
	let errors = []

	conn.query(`select * from assignment where subject='${req.user.subject}' order by deadline desc`,function(err,rows){
		if(err) {
			errors.push({msg: 'unable to find data. pls try after some time'})
			return false
		}
		if(rows.length == 0){
			errors.push({msg: 'no data to display'})
			res.render('studentDashboard', {errors})
			return false
		}
		else {
			conn.query(`select * from answer where user_id='${req.user.id}'`,function(err1,rows2){
				if(err1) {
					errors.push({msg: 'unable to find data. pls try after some time'})
					return false
				}
				var submitted_ass = []
				if(rows2.length == 0){
					submitted_ass = []
				}
				else {
					rows2.forEach(function(list){
						submitted_ass.push(list.assignment_id)	
					})
				}

				res.render('studentDashboard', {user:req.user, data: rows, answers:submitted_ass})
			})
		}
	})
})

module.exports = router