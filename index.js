const express = require('express')
const path = require('path')

const dotenv = require("dotenv").config()
const { auth } = require('express-openid-connect')
const { requiresAuth } = require('express-openid-connect');

const app = express()
const PORT = process.env.port || 3000

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, '/public'));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }))


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.BASE
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config))




app.get("/", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("index", {"username": req.oidc.user.given_name})
	} else {
		res.render("index")
	}
})

app.get("/contact", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("contact", {"username": req.oidc.user.given_name})
	} else {
		res.render("contact")
	}
})

app.get("/about", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("about", {"username": req.oidc.user.given_name})
	} else {
		res.render("about")
	}
})

app.get("/privacy", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("privacy", {"username": req.oidc.user.given_name})
	} else {
		res.render("privacy")
	}
})

app.get('/profile', requiresAuth(), (req, res) => {
	res.send(JSON.stringify(req.oidc.user));
});

app.get("/signup", (req, res) => {
	res.redirect('https://dev-mbqa51sr.us.auth0.com/u/signup?state=hKFo2SB3WDE2R2pmN0RoYkdZclh5cDlXdFlldlB3RWFWUkxUN6Fur3VuaXZlcnNhbC1sb2dpbqN0aWTZIDkxaElnajJTSUMwU05GNHQwQ2gtcllkVGIxR0tjSkZro2NpZNkgMU8wUnY0OVdRNmJvZlZrbmRIY2ZpU2V0ZHV1eTNKb04')
})

// App
app.get("/app", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("app/main")
	} else {
		res.status(404).send("Sesssion expired.")
	}
})


// 404
app.get('*', function(req, res){
	res.status(404).send('404 Error. Page not found.')
})

app.listen(PORT, () => console.log(`Server online on port: ${PORT}`))