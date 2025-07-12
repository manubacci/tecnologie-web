const root = __dirname;

const express = require('express');
const cors = require('cors');

let app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
	origin: 'http://...', //complete
	credentials: true,
}));

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

app.use(session({
	secret: '...', //complete
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false }
}));
app.enable('trust proxy');

app.use(passport.initialize());
app.use(passport.session());

const mongo = require(root + '/scripts/mongo.js');
const credentials = {
	username: "...", //complete
	password: "...", //complete
	site: "..." //complete
}
mongo.connect(credentials);

passport.use(new LocalStrategy(async (username, password, done) => {
	try {
		let user = await mongo.find(username, 'users');
		if (!user)
			user = await mongo.find(username, 'users', username);

		if (!user)
			return done(null, false, { message: 'User not found.' });

		const match = await bcrypt.compare(password, user.password);
		if (!match)
			return done(null, false, { message: 'Incorrect password.' });

		return done(null, user);
	} catch (error) {
		done(error);
	}
}));

passport.serializeUser((user, done) => {
	done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
	try {
		const user = await mongo.find(username, 'users');
		if (!user) {
			return done(new Error('User not found when deserializing.'));
		}
		done(null, user);
	} catch (error) {
		done(error);
	}
});

app.post('/api/user/register', async (req, res) => {
	const username = await mongo.find(req.body.username, 'users'),
		email = await mongo.find(req.body.username, 'users', req.body.email);
	if (username && email)
		res.json({ message: 'Username and Email already in use.', user: null });
	else if (username)
		res.json({ message: 'Username already in use.', user: null });
	else if (email)
		res.json({ message: 'Email already in use.', user: null });
	else {
		req.body.password = await bcrypt.hash(req.body.password, 10);
		const result = await mongo.save(req.body, 'users');
		res.json({ message: 'User registered successfully.', user: result });
	}
});

app.post('/api/user/login', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err)
			return next(err);

		if (!user)
			return res.json({
				message: 'Incorrect username or password.',
				user: null
			});

		req.logIn(user, (err) => {
			if (err) return next(err);

			return res.json({
				message: 'Login successful.',
				user: user
			});
		});
	})(req, res, next);
});

app.post('/api/user/update', async (req, res) => {
	req.body.password = await bcrypt.hash(req.body.password, 10);
	result = await mongo.update(req.body, 'users');
	res.json({ message: 'User updated successfully.', user: result });
});

app.get('/api/user/profile', (req, res) => {
	if (req.isAuthenticated()) {
		return res.json({
			message: 'Profile retrieved successfully.',
			user: req.user
		});
	} else return res.json({
		message: 'User not authenticated.',
		user: null
	});
});

app.post('/api/user/logout', (req, res) => {
	req.logout((err) => {
		if (err)
			return res.json({ message: 'Logout failed.', error: err });
		req.session.destroy(() => {
			res.json({ message: 'Logout successful.' });
		});
	});
});

app.put('/api/settings/update', async function (req, res) {
	const result = await mongo.update(req.body, 'settings');
	res.json({ message: 'Settings updated successfully.', settings: result });
});

app.get('/api/settings/find', async function (req, res) {
	const result = await mongo.find(req.query.user, 'settings');
	res.json({ message: 'Settings retrieved successfully.', settings: result });
});


app.get('/api/calendars/find', async function (req, res) {
	const result = await mongo.find(req.query.user, 'calendars');
	res.json({ message: 'Calendars retrieved successfully.', calendars: result });
});

app.put('/api/calendars/update', async function (req, res) {
	let result = await mongo.find(req.body.user, 'calendars');
	const title = result.find(calendar => calendar.title === req.body.title);

	if (title && title._id.toString() !== req.query.id)
		res.json({ message: 'Title already in use.', calendar: null });
	else {
		result = await mongo.update(req.body, 'calendars', req.query.id);
		res.json({ message: 'Calendars updated successfully.', calendar: result });
	}
});

app.get('/api/calendars/drop', async function (req, res) {
	await mongo.drop(req.query.id, 'calendars');
	res.json({ message: 'Calendars deleted successfully.' });
});


app.get('/api/events/find', async function (req, res) {
	const result = await mongo.find(req.query.user, 'events');
	res.json({ message: 'Events retrieved successfully.', events: result });
});

app.put('/api/events/update', async function (req, res) {
	const result = await mongo.update(req.body, 'events');
	res.json({ message: 'Events updated successfully.', event: result });

});

app.get('/api/events/drop', async function (req, res) {
	await mongo.drop(req.query.id, 'events');
	res.json({ message: 'Events deleted successfully.' });
});


app.get('/api/notes/find', async function (req, res) {
	const result = await mongo.find(req.query.user, 'notes');
	res.json({ message: 'Notes retrieved successfully.', notes: result });
});

app.put('/api/notes/update', async function (req, res) {
	const result = await mongo.update(req.body, 'notes');
	res.json({ message: 'Notes updated successfully.', note: result });

});

app.get('/api/notes/drop', async function (req, res) {
	await mongo.drop(req.query.id, 'notes');
	res.json({ message: 'Notes deleted successfully.' });
});

app.delete('/api/purge', async function (req, res) {
	await mongo.purge();
	res.json({ message: 'All databases deleted successfully.' });
});

app.get('/api/dump', async function (req, res) {
	const result = await mongo.dump();
	res.json({ message: 'Dump generated successfully.', dump: result });
});


app.use((err, req, res, next) => {
	console.error(err);
	res.json({ error: 'Something went wrong.' });
});

app.use(express.static(root + '/dist'));
app.get('*', (_, res) => {
	res.sendFile(root + '/dist/index.html');
});

app.listen(8000, function () {
	global.startDate = new Date();
})