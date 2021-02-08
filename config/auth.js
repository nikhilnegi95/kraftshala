ensureAuthenticated = function(req, res, next) {
	if(req.isAuthenticated() && req.user.login_as == 'instructor') {
		return next()
	}
	res.redirect('/instructor/login')
}

ensureStudentAuthenticated = function(req, res, next) {
	if(req.isAuthenticated() && req.user.login_as == 'student') {
		return next()
	}
	res.redirect('/student/login')
}

module.exports = {ensureAuthenticated, ensureStudentAuthenticated}