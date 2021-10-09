const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

const mongoose = require('mongoose');

const session = require('express-session');

const { isLoggedIn } = require('./middleware/middleware');

const io = require('socket.io')(http, { pingTimeout: 60000 });


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
		currentUser: req.session.user,
	}

	res.status(200).render('home/home', payload);
});

const authRoutes = require('./routes/auth');
app.use(authRoutes);

const postsRoutes = require('./routes/posts');
app.use('/api/posts', postsRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

const profileRoutes = require('./routes/profile');
app.use(profileRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/uploads', uploadRoutes);

const chatRoutes = require('./routes/chat');
app.use(chatRoutes);

const notificationsRoutes = require('./routes/notifications');
app.use(notificationsRoutes);

app.all('*', isLoggedIn, (req, res) => {
	res.sendStatus(404);
});


//** SOCKET CONNECTIONS
io.on('connection', (socket) => {
	socket.on('setup', (userID) => {
		socket.join(userID);
		socket.emit('connected');
	});

	socket.on('join chat room', (room) => {
		socket.join(room);
	});

	socket.on('start typing', (room) => {
		socket.broadcast.to(room).emit('user typing');
	});

	socket.on('stop typing', (room) => {
		socket.broadcast.to(room).emit('user stopped typing');
	});

	socket.on('new message', (message) => {
		for (let i = 0; i < message[0].chat.users.length; i++) {
			if (message[0].chat.users[i] === message[0].sender._id) {
				continue;
			}
			socket.to(message[0].chat.users[i]).emit('message received', message);
			socket.to(message[0].chat.users[i]).emit('notification received', message);
		}
	});

	// socket.on('notification', (users) => {
	// 	for (let i = 0; i < users.length; i++) {
	// 		if (users[i] === req.session.user.id) {
	// 			continue;
	// 		}
	// 		socket.to(users[i]).emit('notification received', message);
	// 	}
	// });

});


//** APP.LISTEN
const port = process.env.PORT || 20001;
http.listen(port, () => {
	console.log(`Running: ${port}`);
});