const http = require("http");
const express = require("express");
const app = express();
const morgan = require('morgan')
app.use(express.json());
const cors = require('cors')

app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request) => {
    return JSON.stringify(request.body)
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let notes = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456",
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345",
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
  },
];

const entries = notes.length;

app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/info", (request, response) => {
  const date = new Date();
  const formattedDate = date.toString();
  const responseText = `
    <html>
        <body>
            <p>Phonebook has info for ${entries} people</p>
            <p>${formattedDate}</p>
        </body>
    </html>
    `;
  response.set('Content-Type', 'text/html');
  response.send(responseText);
});

app.get("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map((n) => Number(n.id)))
    : 0;
  return String(maxId + 1);
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number is missing",
    });
  }
  else if (notes.some(entry => entry.name === body.name)) {
    return response.status(400).json({
        error: "name must be unique",
      });
  }

  const note = {
    id: generateId(),
    name: body.name,
    number: body.number,
    important: Boolean(body.important) || false
  };

  notes = notes.concat(note);
  response.json(note);
});

app.delete("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  notes = notes.filter((note) => note.id !== id);
  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


