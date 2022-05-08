const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.port || 3000

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, '/public'));

app.use("/app", require("./routes/app"))
app.use(express.static("public"));

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