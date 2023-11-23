const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'text/plain' }));
app.use(multer().any());

const host = 'localhost';
const port = 8000;
const type = 'utf-8';

const notesList = __dirname + '/notes.json';


if (!fs.existsSync(notesList)) {
    fs.writeFileSync(notesList, '[]');
}

// GET home
app.get("/", (req, res) => {
    res.send("The service has been initiated. Explore the following paths: /notes  /UploadForm.html /upload /notes/:name ");
});

// GET notes
app.get("/notes", (req, res) => {
    try {
        const data = fs.readFileSync(notesList, type);
        const notes = data ? JSON.parse(data) : [];
        res.json(notes);
    } catch (error) {
        res.status(500).send("Couldn't read file properly.");
    }
});

// GET upload form
app.get("/UploadForm.html", (req, res) => {
    const form = __dirname + "/static/UploadForm.html";
    res.sendFile(form);
});

// POST upload
app.post("/upload", (req, res) => {
    const noteName = req.body.note_name;
    const noteContent = req.body.note;
    const notes = JSON.parse(fs.readFileSync(notesList, type));

    if (notes.some((note) => note.note_name === noteName)) {
        res.status(400).send('A note with that name has already been created! ');
    } else {
        const newNote = { note_name: noteName, note: noteContent };
        notes.push(newNote);
        fs.writeFileSync(notesList, JSON.stringify(notes, null, 2), type);
        res.status(201).send('The creation of the note was successful. :)');
    }
});

// GET one note
app.get("/notes/:name", (req, res) => {
    const noteName = req.params.name;
    const notes = JSON.parse(fs.readFileSync(notesList, type));
    const note = notes.find(note => note.note_name == noteName);
    if (note) {
        res.status(200).send(note.note);
    } else {
        res.status(404).send("Note not found.");
    }
});

// PUT one note
app.put("/notes/:name", (req, res) => {
    const noteName = req.params.name;
    const updatedText = req.body.note;

    const notes = JSON.parse(fs.readFileSync(notesList, type));
    const note = notes.find(note => note.note_name == noteName);

    if (note) {
        note.note = updatedText;
        fs.writeFileSync(notesList, JSON.stringify(notes, null, 2), type);
        res.status(200).send('Note has been successfully updated.');
    } else {
        res.status(404).send("Note not found.");
    }
});

// DELETE one note
app.delete("/notes/:name", (req, res) => {
    const noteName = req.params.name;
    const notes = JSON.parse(fs.readFileSync(notesList, type));
    const note = notes.find(note => note.note_name == noteName);
    const idx = notes.indexOf(note);

    if (idx !== -1) {
        notes.splice(idx, 1);
        fs.writeFileSync(notesList, JSON.stringify(notes, null, 2));
        res.status(200).send("Note was deleted.");
    } else {
        res.status(404).send("Note not found.");
    }
});

app.listen(port, () => {
    console.log(`Started on http://${host}:${port}`);
});
