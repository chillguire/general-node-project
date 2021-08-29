const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

const mongoose = require('mongoose');

const session = require('express-session');

const { isLoggedIn } = require('./middleware/middleware');


//** DB CONFIG
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/general-node-project';
mongoose.connect(dbURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('DB connected');
});


//** APP CONFIG
//? general
app.use(express.urlencoded({ extended: false, }));
app.use(express.json());

//? views and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//? sessions
const sessionSecret = process.env.SESSION_SECRET || 'uwu';
const sessionConfig = {
	name: 'nodeSession',
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		secure: false,
		sameSite: 'Lax',
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // ms/s * s/m * m/h * h/d * d/w
		maxAge: 1000 * 60 * 60 * 24 * 7,
	}
}

app.use(session(sessionConfig));


//** ROUTES
app.get('/', isLoggedIn, (req, res) => {
	const payload = {
		pageTitle: 'uwu',
	}

	res.status(200).render('home', payload);
});

const authRoutes = require('./routes/auth');
app.use(authRoutes);

app.all('*', isLoggedIn, (req, res) => {
	res.sendStatus(404);
});


//** APP.LISTEN
const port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log(`Running: ${port}`);
});