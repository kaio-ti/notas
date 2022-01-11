import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

const usersList = [];

const cpfExists = (req, res, next) => {
  const data = req.params;
  const cpf = usersList.find((user) => user.cpf === data.cpf);
  if (cpf === undefined) {
    return res.status(404).json({ error: "invalid cpf - user not registered" });
  }
  next();
};

app.get("/users", (req, res) => {
  res.status(200).json(usersList);
});

app.get("/users/:cpf/notes", (req, res) => {
  const { cpf } = req.params;
  const specificUser = usersList.find((user) => user.cpf === cpf);
  res.json(specificUser.notes);
});

app.post("/users", (req, res) => {
  const data = req.body;
  data.id = uuidv4();
  data.notes = [];
  usersList.push(data);
  res.status(201).json(data);
});

app.post("/users/:cpf/notes", cpfExists, (req, res) => {
  const { cpf } = req.params;
  const data = req.body;
  data.id = uuidv4();
  data.created_at = new Date();
  const specificUser = usersList.find((user) => user.cpf === cpf);
  specificUser.notes.push(data);
  res.status(201).json({
    message: `${data.title} was added into ${specificUser.name}'s notes`,
  });
});

app.patch("/users/:cpf", cpfExists, (req, res) => {
  const { cpf } = req.params;
  const data = req.body;
  const specificUser = usersList.find((user) => user.cpf === cpf);
  specificUser.cpf = data.cpf;
  specificUser.name = data.name;
  res.status(200).json({ message: "User is updated", users: usersList });
});

app.patch("/users/:cpf/notes/:id", cpfExists, (req, res) => {
  const { cpf, id } = req.params;
  const data = req.body;
  const specificUser = usersList.find((user) => user.cpf === cpf);
  const userNotes = specificUser.notes.find((note) => note.id === id);
  userNotes.title = data.title;
  userNotes.content = data.content;
  userNotes.updated_at = new Date();
  res.status(200).json(userNotes);
});

app.delete("/users/:cpf", cpfExists, (req, res) => {
  const { cpf } = req.params;
  const specificUser = usersList.find((user) => user.cpf === cpf);
  const index = usersList.indexOf(specificUser);
  usersList.splice(index, 1);
  res.status(200).json({
    message: "User is deleted",
    updated_list: usersList.splice(index, 1),
  });
});

app.delete("/users/:cpf/notes/:id", cpfExists, (req, res) => {
  const { cpf, id } = req.params;
  const specificUser = usersList.find((user) => user.cpf === cpf);
  const userNotes = specificUser.notes.find((note) => note.id === id);
  const index = specificUser.notes.indexOf(userNotes);
  specificUser.notes.splice(index, 1);
  res.status(200).json([]);
});

app.listen(3000);
