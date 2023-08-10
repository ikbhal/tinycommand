const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const exec = require('child_process').exec;

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(flash());

// Routes
app.get('/', (req, res) => {
    res.render('index.ejs', { message: req.flash('message') });
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
