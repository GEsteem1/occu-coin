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
  baseURL: 'http://localhost:3000/',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.BASE
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config))

// req.isAuthenticated is provided from the auth router
app.get("/", (req, res) => {
	res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
})

app.get('/profile', requiresAuth(), (req, res) => {
	res.send(JSON.stringify(req.oidc.user));
  });

app.get("/", (req, res) => {
	res.render("index")
})

app.get("/contact", (req, res) => {
	res.render("contact")
})

app.get("/about", (req, res) => {
	res.render("about")
})

app.get("/privacy", (req, res) => {
	res.render("privacy")
})

// 404
app.get('*', function(req, res){
	res.status(404).send('404 Error. Page not found.')
})

app.listen(PORT, () => console.log(`Server online on port: ${PORT}`))