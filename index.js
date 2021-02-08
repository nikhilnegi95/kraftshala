const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
require('./config/passport')(passport) //passport config

const homeRoute = require('./src/routes/home')
const instructor = require('./src/routes/instructor')
const student = require('./src/routes/student')
const port = 3000;

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

//template engine
app.use(expressLayouts)
app.set('views', './src/views')
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: false}))
app.use(flash());

//express session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))

app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	next()
})

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//routes
app.use('/', homeRoute)
app.use('/instructor', instructor)
app.use('/student', student)


app.listen(port, () => {
	console.log(`app is running on port ${port}`)
})