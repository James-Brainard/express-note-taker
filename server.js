const { uuid } = require('uuidv4');
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

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


// get /api/notes and SHOULD READ the db.json file and RETURN all saved notes as JSON
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
app.post('/api/notes', async (req, res) => {
  try {
    const { title, text } = req.body;

    if (title && text) {
      const newField = {
        title,
        text,
        // Give each note a unique ID when it's saved.
        id: uuid()
      }
      // Need to read the db.json file to then parse the array, push the NEWFIELD into the datatext being parsed.
      const dataText = await fs.readFileSync('./db/db.json', 'utf8');

      const dataArr = JSON.parse(dataText);

      dataArr.push(newField);

      const textString = JSON.stringify(dataArr, null, 2);

      await fs.writeFileSync('./db/db.json', textString);

      console.info('New note has been written to JSON file!')

      const response = {
        status: 'success',
        body: newField
      }

      return res.status(201).json(response);
    } else {
      return res.status(500).json('Error in posting new note');
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});


app.delete('/api/notes/:id', async (req, res) => {
  try {
    // Need to read the db.json file to parse through the array.
    const dataId = await fs.readFileSync('./db/db.json', 'utf8');
    const idArr = JSON.parse(dataId);
    const requestedId = req.params.id;
    function removeId(array, id) {
      return array.reduce((accum, currentValue) => {
        console.log(currentValue);
        if (currentValue.id !== id) {
          accum.push(currentValue);
        }
        console.log(accum);
        return accum;
      }, [])
    }
    let removal = removeId(idArr, requestedId);
    const writeRemoval = JSON.stringify(removal, null, 2);
    await fs.writeFileSync('./db/db.json', writeRemoval);
    return res.status(201).json('removed');
  } catch (err) {
    return res.status(500).json(err);
  }
});


// Get * should return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
