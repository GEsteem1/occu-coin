const express = require('express')
const path = require('path')
const favicon = require("serve-favicon")
var bodyParser = require('body-parser') 

const dotenv = require("dotenv").config();
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

// const { spawn } = require("child_process")
const webdriver = require("selenium-webdriver")
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require("chromedriver");
const {By, Key, until} = require('selenium-webdriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

const app = express();
const PORT = process.env.port || 3000;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/public'));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(favicon(path.join(__dirname, "/public/images/icon.png")));


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.BASE
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.get("/", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("index", {"username": req.oidc.user.given_name});
	} else {
		res.render("index");
	}
});

app.get("/contact", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("contact", {"username": req.oidc.user.given_name});
	} else {
		res.render("contact");
	}
});

app.get("/about", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("about", {"username": req.oidc.user.given_name});
	} else {
		res.render("about");
	}
});

app.get("/privacy", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("privacy", {"username": req.oidc.user.given_name});
	} else {
		res.render("privacy");
	}
});

app.get("/signup", (req, res) => {
	res.redirect('https://dev-mbqa51sr.us.auth0.com/u/signup?state=hKFo2SB3WDE2R2pmN0RoYkdZclh5cDlXdFlldlB3RWFWUkxUN6Fur3VuaXZlcnNhbC1sb2dpbqN0aWTZIDkxaElnajJTSUMwU05GNHQwQ2gtcllkVGIxR0tjSkZro2NpZNkgMU8wUnY0OVdRNmJvZlZrbmRIY2ZpU2V0ZHV1eTNKb04');
});

// App
app.get("/app", (req, res) => {
	if (req.oidc.isAuthenticated()) {
		res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email});
	} else {
		res.status(404).send("Session expired.");
	}
});

app.post("/app", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	let data = [];

	(async () => {
		let driver = await new webdriver.Builder().forBrowser(webdriver.Browser.CHROME).setChromeOptions(new chrome.Options().headless()).build();
		try {
			await driver.get("https://adfs.svvsd.org/adfs/ls/?client-request-id=cd388547-ac70-46bf-ad73-2f7195983ae3&username=&wa=wsignin1.0&wtrealm=urn%3afederation%3aMicrosoftOnline&wctx=estsredirect%3d2%26estsrequest%3drQQIARAA42KwUs4oKSkottLXz0zWKy4rK07Ryy9K109OzC0oLdYvLikrSszMKxLiEnBvtThbsGa_29pi_cKpM6wez2LkhCtfxaiDz5TgYH-YSfrBnsH6hxgV4y2TzEwSk9OME9MMkiwMjIxTkswNLQ2TTQ2TDBNTTZItLzAyvmBkvMXEGpyYm2M0i5kHbkJxZvEmZhXjVHPLJENDC10L0xQTXZMkM1PdxMRUU91Uc7OUJCMTYwOTJIsLLDyvWHgMWK04OLgE-CXYFBh-sDAuYgV6xl7zgKn24YtOzcGB01er-TGcYtUvL7WoKvRPLim39ExOqaoIz_epDM9NNYrwCEj2S_N2KsvxcksuCfD2LNYOtDW0MpzAxnuKjeEDG2MHO8MsdoYDnIwHeBl-8E2d2NK1ZG_PWw8A0#");
			await driver.findElement(By.id("userNameInput")).sendKeys(email);
			await driver.findElement(By.id("passwordInput")).sendKeys(password);
			await driver.findElement(By.id("submitButton")).click();
			await driver.wait(until.urlIs('https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/today'), 10000);
			await driver.get("https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/grades");
			await driver.wait(until.elementLocated(By.id("main-workspace")), 10000);
			await driver.switchTo().frame(driver.findElement(By.id("main-workspace")));
			await new Promise(r => setTimeout(r, 3000));
			let grades = await driver.findElements(By.xpath(`//*[contains(text(),'%')]`));

			for (let i=0; i < grades.length; i++) {
				let txt = await grades[i].getText();
				
				if (txt) {
					data.push(txt);
				}
			}
		} catch (err) {
			res.render("app/main", { "error": err })
		} finally {
			await driver.quit();
			res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "grades": data})
		}
	})();

	// const python = spawn("python", ["./infinitecampus.py", email, password])

	// python.stdout.on("data", (d) => {
	// 	data += d.toString()
	// })
	// python.stderr.on("data", d => {console.log("Error, " + data)})

	// python.on("exit", (c) => {
	// 	data = data.split("\r\n")
	// 	data.pop()
	// 	res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "grades": data})
	// })
})


// 404
app.get('*', function(req, res){
	res.status(404).send('404 Error. Page not found.');
});

app.listen(PORT, () => console.log(`Server online on port: ${PORT}`));