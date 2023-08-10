const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const flash = require('connect-flash');

const app = express();
const port = 3019; // Change the port to 3019

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(flash());

app.get('/', (req, res) => {
    const flashMessage = req.flash('success');
    res.render('index', { flashMessage });
});

app.post('/runCommand', (req, res) => {
    const command = req.body.command;

    exec(`sudo ${command}`, (error, stdout, stderr) => {
        if (error) {
            req.flash('error', stderr);
            res.redirect('/');
        } else {
            req.flash('success', 'Command executed successfully.');
            res.redirect(`/?command=${encodeURIComponent(command)}&output=${encodeURIComponent(stdout)}`);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
