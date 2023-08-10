const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const port = 3019;

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
app.get('/', async (req, res) => {
    try {
        const history = getCommandHistory();
        res.render('index', { message: req.flash('message'), history });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.post('/runCommand', async (req, res) => {
    const command = req.body.command;
    const sudoCommand = `sudo ${command}`;

    try {
        const { stdout, stderr } = await executeCommand(sudoCommand);
        saveCommandHistory(command);
        req.flash('message', `Output: ${stdout}`);
    } catch (error) {
        req.flash('message', `Error: ${error.message}`);
    }

    res.redirect('/');
});

// Functions to execute command, save history, and retrieve history
const historyFilePath = path.join(__dirname, 'command_history.json');

function saveCommandHistory(command) {
    let history = getCommandHistory();
    history.unshift({ command, timestamp: new Date().toISOString() });

    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
}

function getCommandHistory() {
    try {
        if (fs.existsSync(historyFilePath)) {
            const content = fs.readFileSync(historyFilePath, 'utf8');
            return JSON.parse(content);
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
}


async function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
