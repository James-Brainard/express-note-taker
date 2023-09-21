// GIVEN a note-taking application
// WHEN I open the Note Taker
// THEN I am presented with a landing page with a link to a notes page
// WHEN I click on the link to the notes page
// THEN I am presented with a page with existing notes listed in the left-hand column, plus empty fields to enter a new note title and the note’s text in the right-hand column
// WHEN I enter a new note title and the note’s text
// THEN a Save icon appears in the navigation at the top of the page
// WHEN I click on the Save icon
// THEN the new note I have entered is saved and appears in the left-hand column with the other existing notes
// WHEN I click on an existing note in the list in the left-hand column
// THEN that note appears in the right-hand column
// WHEN I click on the Write icon in the navigation at the top of the page
// THEN I am presented with empty fields to enter a new note title and the note’s text in the right-hand column

const { v4: uuidv4 } = require('uuid');
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
})

// Set up get /notes to return the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
})


// create API's to get /api/notes and SHOULD READ the db.json file and RETURN all saved notes as JSON
app.get('/api/notes', (req, res) => {
  // Obtain existing notes. We get the api/notes and have to read the saved notes already entered in. 
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const savedNotes = JSON.parse(data);
      return res.json(savedNotes);
    }
  })
})


// POST /api/notes should receive a new note to save on the request body
app.post('./api/notes', async (req, res) => {
  try {
  console.info(`${req.method} request have been received to POST`);
  
  const { title, text } = req.info;
  
  if (title && text) {
    const newField = {
      title,
      text,
      // Give each note a unique ID when it's saved. NPM packages can help with this
      review_id: uuidv4()
    }
    const dataText = await fs.readFile('./db/db.json', 'utf8');

    const dataArr = JSON.parse(dataText);

    dataArr.push(newField);

    const textString = JSON.stringify(dataArr, null, 2);

    await fs.writeFile('./db/db.json', textString);

    console.info('New note has been written to JSON file!')
    
    const response = {
      status: 'success',
      body: newField,
    };

    return res.status(200).json(response);
  } else {
    return res.status(500).json('Error in posting new note');
  }
} catch (err) {
  return res.status(500).json(err);
}
});


// add it to the db.json file, then return the new note to the client.


// Get * should return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
