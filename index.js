import express from 'express';
import bodyParser from 'body-parser';
import path from 'path'
import { appendFile } from 'fs/promises';
import fs from 'fs';
const app = express();
// to  set the view enging as pug
app.set("view engine", "pug");
// to take files from the right folder
app.set("views", path.resolve("./dist"));
//import booksFile from './books.json' assert{type:"json"};
app.use(bodyParser.json());

//create file_existed to check if the file existed when we call The Get APIS
let file_existed = false;
let Valid_format=false;
function readFileSynchronously(path) {
    try {
        const file = fs.readFileSync(path);
        const books = JSON.parse(file);
        file_existed = true;
        return books;
    } catch (error) {
        console.log("file not existed")
        console.error(error.message);
    }
}


// GET All Books API
app.get('/books', (req, res) => {
    var books = readFileSynchronously('books.json');
    if (file_existed) {
        var data = books.books;
        res.render("booksPage", { data })
    }
    else {
        res.send("no such a directory Try Create one");
    }
})

//GET books by ID
app.get('/books/:id', (req, res) => {
    var books = readFileSynchronously('books.json');
    if (file_existed) {
        let id = req.params.id;
        const book = books.books.find(a => a.id == id);
        if (!book) {
            res.status(404).send("book does not exist");
        }
        else {
            res.render("booksDetail", { book });
        }
    }
    else {
        res.send("no such directory to get this Book from Try Create one");
    }
})

//Create New Book,If File not existed Create one
app.post('/books', (req, res) => {
    var books = readFileSynchronously('books.json');
    let body = req.body;
    if (file_existed) {
        const CurrentBook = books.books.find(book => book.id == body.id);
        if (CurrentBook) {
            return res.send("this book is alredy existed");
        }
        else {
            books.books.push(body);
            appendToFile('books.json', JSON.stringify(books));
            res.send("this book has been added successfully");
        }
    }
    //create new file
    else{
        const Json_data={"books":[]};
        fs.writeFileSync("books.json",JSON.stringify(Json_data));
        Json_data.books.push(body);
        appendToFile('books.json',JSON.stringify(Json_data));
    }
})

// to handle invalid inputs
app.get('*', (req, res) => {
    res.status(404).send("invalid endpoint");
})
app.post('*', (req, res) => {
    res.status(404).send("invalid endpoint");
})


async function appendToFile(fileName, data) {
    try {
        await appendFile(fileName, data, { flag: 'w' });
        console.log(`Appended data to ${fileName}`);
    } catch (error) {
        console.error(`Got an error trying to append the file: {error.message}`);
    }
}




app.listen(8000, () => {
    console.log("express is running on port 8000!");
})

