const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const contactsFile = path.join(__dirname, 'contacts.json');

function loadContacts() {
    try {
        if (fs.existsSync(contactsFile)) {
            return JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
        }
    } catch (err) {
        console.error('Error loading contacts:', err.message);
    }
    return [];
}

function saveContacts(contacts) {
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'hm2853375@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contacts = loadContacts();
    const newContact = {
        id: Date.now(),
        name,
        email,
        message,
        timestamp: new Date().toISOString()
    };
    contacts.push(newContact);
    saveContacts(contacts);

    try {
        await transporter.sendMail({
            from: email,
            to: 'hm2853375@gmail.com',
            subject: `Portfolio Contact: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        });
    } catch (e) {
        console.log('Email skipped');
    }

    res.json({ success: true, message: 'Message sent successfully!' });
});

app.get('/api/contacts', (req, res) => {
    res.json(loadContacts());
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
