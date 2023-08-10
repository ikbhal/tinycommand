const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const exec = require('child_process').exec;
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3019; // Change the port to 3019

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
    session({
        secret: 'muhammed',
        resave: false,
        saveUninitialized: true
    })
);
app.use(flash());

// Set EJS as the view engine and configure views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { message: req.flash('message') });
});

app.post('/runCommand', (req, res) => {
    const command = req.body.command;
    const sudoCommand = `sudo ${command}`;

    exec(sudoCommand, (error, stdout, stderr) => {
        if (error) {
            req.flash('message', `Error: ${stderr}`);
        } else {
            req.flash('message', `Output: ${stdout}`);
        }
        res.redirect('/');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
