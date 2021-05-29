var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');
const book = require('../models/book');
const { body, validationResult } = require('express-validator');

// não sei o que é isso
const { find } = require('../models/book');

exports.index = (req,res) =>{
    async.parallel({
        book_count: (callback)=>{
            Book.countDocuments({},callback);
        },
        book_instance_count: (callback)=>{
            BookInstance.countDocuments({},callback);
        },
        book_instance_available_count: (callback)=>{
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: (callback)=>{
            Author.countDocuments({},callback);
        },
        genre_count: (callback)=>{
            Genre.countDocuments({},callback);
        }
    }, (err, results)=>{
        // renderizar no /views/index.pug
        res.render('index', {title:'Local Library Home', error: err, data: results});
    });
};

exports.book_list = (req,res,next) =>{
    // find() returns all Book objects, here, only title and author.
    // this will replace the euthor id stored for each Book with a full Author document.
    Book.find({},'title author').populate('author').exec((err,list_books)=>{
        if (err) {return next(err);}
        res.render('book_list', {title:'Book list', book_list: list_books})
    });
};

exports.book_detail = (req,res,next) =>{
    async.parallel({
        book: (callback)=>{
            Book.findById(req.params.id).populate('genre').populate('author').exec(callback);
        },
        book_instance: (callback)=>{
            BookInstance.find({'book':req.params.id}).exec(callback);
        } 
    }, (err, results) => {
        if(err) return next(err);
        if(results.book==null){
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail',{title: results.book.title, book: results.book, book_instances: results.book_instance});
    });
};

exports.book_create_get = (req,res) =>{
    async.parallel({
        authors: (callback) => {
            Author.find(callback);
        },
        genres: (callback) => {
            Genre.find(callback);
        }
    }, (err, results) => {
        res.render('book_form', {title: 'Create book', authors: results.authors, genres:results.genres});
    });
};

exports.book_create_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)) req.body.genre = (typeof req.body.genre === 'undefined') ? [] : new Array(req.body.genre);
        next();
    },

    body('title','Title must not be empty').trim().isLength({min:1}).escape(),
    body('author','Author must not be empty').trim().isLength({min:1}).escape(),
    body('summary','Summary must not be empty').trim().isLength({min:1}).escape(),
    body('isbn','ISBN must be not empty').trim().isLength({min:1}).escape(),
    // the * was use for do the validation in each of the genre array entries
    body('genre*').escape(),

    (req,res,next)=>{
        const errors = validationResult(req);

        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if(!errors.isEmpty()){
            async.parallel({
                authors: (callback)=>{
                    Author.find(callback);
                },
                genres: (callback) => {
                    Genre.find(callback);
                }
            }, (err, results) => {
                if (err) return next(err);

                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', {title:'Create Book', authors:results.authors, genres: results.genres, book: book, errors: errors.array()});
            });
            return;
        } else {
            book.save((err)=>{
                if(err) return next(err);
                res.redirect(book.url);
            });
        }
    }
];

exports.book_delete_get = (req,res,next) =>{
    async.parallel({
        book: (callback)=>{
            Book.findById(req.params.id).populate('genre').populate('author').exec(callback);
        },
        book_instance: (callback)=>{
            BookInstance.find({'book':req.params.id}).exec(callback);
        } 
    }, (err, results) => {
        if(err) return next(err);
        if(results.book==null){
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_delete',{title: results.book.title, book: results.book, book_instances: results.book_instance});
    });
};

exports.book_delete_post = (req,res) =>{
    async.parallel({
        book: (callback) => {
            Book.findById(req.body.bookid).exec(callback);
        },
        book_bookinstances: (callback) => {
            BookInstance.find({'book':req.body.bookid}).exec(callback);
        }
    }, (err,results)=>{
        if (err) return next(err);
        if(results.book_bookinstances.length>0){
            res.render('book_delete',{title: results.book.title, book: results.book, book_instances: results.book_instance});
            return;
        } else {
            Book.findByIdAndRemove(req.body.bookid,function deleteBook(err){
                if(err) return next(err);
                res.redirect('/catalog/books');
            });
        }
    });
};

exports.book_update_get = (req,res,next) =>{
    async.parallel({
        book: (callback) => {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);  
        },
        authors: (callback) => {
            Author.find(callback);
        },
        genres: (callback) => {
            Genre.find(callback);
        },
    }, (err,results) => {
        if (err) return next(err);
        if(results.book==null){
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++){
            for(var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++){
                if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()){
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('book_form',{title:'Update Book', authors: results.authors,genres: results.genres,book:results.book});
    });
};

exports.book_update_post = [
    (req,res,next)=>{
        if(!(req.body.genre instanceof Array)) req.body.genre=(typeof req.body.genre==='undefined')? [] : new Array(req.body.genre);
        next();
    },
    body('title','Title must not be empty').trim().isLength({min:1}).escape(),
    body('author','Author must not be empty').trim().isLength({min:1}).escape(),
    body('summary','Summary must not be empty').trim().isLength({min:1}).escape(),
    body('isbn','ISBN must be not empty').trim().isLength({min:1}).escape(),
    body('genre*').escape(),
    (req,res,next)=>{
        const errors = validationResult(req);
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id: req.params.id
        });
        if(!errors.isEmpty()){
            async.parallel({
                authors: (callback) => {
                    Author.find(callback);
                }, 
                genres: (callback) => {
                    Genre.find(callback);
                },
            }, (err,results) => {
                if (err) return next(err);
                for (let i = 0; i< results.genres.length; i++){
                    if(book.genre.indexOf(results.genres[i]._id)>-1) results.genres[i].checked = 'true';
                }
                res.render('book_form',{title:'Update book',authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
            });
            return;
        } else {
            // Data from form is valid, update the record
            Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
                if (err) return next(err);
                res.redirect(thebook.url);
            });
        }
    }
];

