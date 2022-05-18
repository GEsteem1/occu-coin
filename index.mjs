import express from "express"
import path from "path"
import favicon from "serve-favicon"
import bodyParser from "body-parser"

import dotenv from "dotenv"
dotenv.config();
import { auth } from "express-openid-connect"

// const { spawn } = require("child_process")
// const webdriver = require("selenium-webdriver")
// const chrome = require('selenium-webdriver/chrome');
// const chromedriver = require("chromedriver");
// const {By, Key, until} = require('selenium-webdriver');
// chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

import puppeteer  from "puppeteer"

import { Low, JSONFile} from "lowdb"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();

db.data ||= { users: [] };
const { users } = db.data;

await db.write();
await db.read();

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
	res.render("signup");
});

app.post("/signup", (req, res) => {
	res.redirect('https://dev-mbqa51sr.us.auth0.com/u/signup?state=hKFo2SAxaUJDM1pvRUs2ZUJxaGVYbWhoTkNxOEpNRFQ3OGwwbaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHNsQUoyVUY0djl6czA4cE51QUNTekpybzVScmx5bXFro2NpZNkgMU8wUnY0OVdRNmJvZlZrbmRIY2ZpU2V0ZHV1eTNKb04');
})

function weeksBetween(d1, d2) {
	if (!d1 || !d2) {
		return 0;
	}
    return (d2 - d1) / (7 * 24 * 60 * 60 * 1000);
}

// App
app.get("/app", async (req, res) => {
	if (req.oidc.isAuthenticated()) {
		let user = db.data.users.filter(obj => {return obj.given_name == req.oidc.user.given_name})[0];
		if (user) {
			if (!user.hasOwnProperty("last-ret")) {
				res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "tokens": user.tokens, "can-ret": true });
			} else if (weeksBetween(user["last-ret"], new Date().getTime()) >= 1) {
				res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "tokens": user.tokens, "can-ret": true });
			} else {
				res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "tokens": user.tokens, "can-ret": false});
			}
		} else {
			let userObj = req.oidc.user;
			userObj["tokens"] = 0;
			db.data.users.push(userObj);
			await db.write();
			await db.read();
			
			user = db.data.users.filter(obj => {return obj.given_name == req.oidc.user.given_name});
			
			res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "tokens": user[0].tokens, "can-ret": true });
		}
	} else {
		res.status(404).send("Session expired.");
	}
});

app.post("/app", (req, res) => {
	let user = db.data.users.filter(obj => {return obj.given_name == req.oidc.user.given_name})[0];

	if (user["last-ret"]) {
		if (weeksBetween(user["last-ret"], new Date().getTime()) < 1) {
			res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "tokens": user.tokens, "can-ret": false});
			return;
		}
	}

	let email = req.body.email;
	let password = req.body.password;

	let data = [];
	let raw_data = [];

	(async () => {
		// let driver = await new webdriver.Builder().forBrowser(webdriver.Browser.CHROME).setChromeOptions(new chrome.Options().headless()).build();
		const browser = await puppeteer.launch({headless: true, args: ["--no-sandbox"]});
		try {
			const page = await browser.newPage();
			await page.goto("https://adfs.svvsd.org/adfs/ls/?client-request-id=cd388547-ac70-46bf-ad73-2f7195983ae3&username=&wa=wsignin1.0&wtrealm=urn%3afederation%3aMicrosoftOnline&wctx=estsredirect%3d2%26estsrequest%3drQQIARAA42KwUs4oKSkottLXz0zWKy4rK07Ryy9K109OzC0oLdYvLikrSszMKxLiEnBvtThbsGa_29pi_cKpM6wez2LkhCtfxaiDz5TgYH-YSfrBnsH6hxgV4y2TzEwSk9OME9MMkiwMjIxTkswNLQ2TTQ2TDBNTTZItLzAyvmBkvMXEGpyYm2M0i5kHbkJxZvEmZhXjVHPLJENDC10L0xQTXZMkM1PdxMRUU91Uc7OUJCMTYwOTJIsLLDyvWHgMWK04OLgE-CXYFBh-sDAuYgV6xl7zgKn24YtOzcGB01er-TGcYtUvL7WoKvRPLim39ExOqaoIz_epDM9NNYrwCEj2S_N2KsvxcksuCfD2LNYOtDW0MpzAxnuKjeEDG2MHO8MsdoYDnIwHeBl-8E2d2NK1ZG_PWw8A0#");
			// await driver.findElement(By.id("userNameInput")).sendKeys(email);
			// await driver.findElement(By.id("passwordInput")).sendKeys(password);
			// await driver.findElement(By.id("submitButton")).click();
			// await driver.wait(until.urlIs('https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/today'), 10000);
			// await driver.get("https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/grades");
			// await driver.wait(until.elementLocated(By.id("main-workspace")), 10000);
			// await driver.switchTo().frame(driver.findElement(By.id("main-workspace")));
			// await new Promise(r => setTimeout(r, 3000));
			// let grades = await driver.findElements(By.xpath(`//*[contains(text(),'%')]`));

			await page.type("#userNameInput", email);
			await page.type("#passwordInput", password);
			await page.click("#submitButton");
			await page.waitForFunction("window.location.href == 'https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/today'");
			await page.goto("https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/grades");
			await page.waitForNavigation({ waitUntil: 'networkidle2' });
			await new Promise(r => setTimeout(r, 1000));
			await page.waitForSelector("#main-workspace");
			const elementHandle = await page.waitForSelector('iframe[id="main-workspace"]');
			const frame = await elementHandle.contentFrame();
			// const [grades] = await frame.$x(`//*[contains(text(),'%')]`);
			// const grades = await frame.evaluateHandle(() => document.evaluate(`//*[contains(text(),'%')]`, document, null));
			const grades = await frame.$x("//*[contains(text(),'%')]");
			// grades = await page.evaluate(grade => grade.innerText, grades);

			for (let i=0; i < grades.length; i++) {
				let txt = await (await grades[i].getProperty("innerText")).jsonValue();
				
				if (txt.length > 3 && txt.length <= 12) {
					data.push(txt);
					raw_data.push(parseFloat(txt.replace("(", "")));
				}
			}
		} catch (err) {
			console.log("[FATAL]:", err);
			res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "tokens": user["tokens"], "error": "Sorry! Something went wrong. This was most likely because you entered in the wrong password or username.", "can-ret": true });
		} finally {
			await browser.close();
			
			for (let i=0; i < raw_data.length; i++) {
				if (raw_data[i] > 90) {
					user["tokens"] += 1;
				}
			}
			user["last-ret"] = new Date().getTime();

			await db.write();
			await db.read();

			user = db.data.users.filter(obj => {return obj.given_name == req.oidc.user.given_name})[0];

			res.render("app/main", {"name": req.oidc.user.given_name, "email": req.oidc.email, "pic": req.oidc.user.picture, "grades": data, "tokens": user["tokens"]})
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

app.listen(PORT, () => console.log(`[SERVER]: Online on port: ${PORT}`));