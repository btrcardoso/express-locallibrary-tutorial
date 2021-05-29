var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

/*
validator = require('express-validator');
body = validator.body();
validationResult = validator.validationResult();
*/
const {body, validationResult} = require('express-validator');

exports.genre_list = (req,res,next) =>{
    Genre.find().sort([['name','ascending']]).exec((err,list_genre)=>{
        if (err) next(err);
        res.render('genre_list', {title:'Genre list', genre_list:list_genre});
    })
};

//serve pra consertar o problema do req.params.id quando o usuario coloca um id errado no path, mas não funcionou
var mongoose = require('mongoose');
exports.genre_detail = (req,res,next) =>{
    //serve pra consertar o problema do req.params.id quando o usuario coloca um id errado no path, mas não funcionou
    var id = mongoose.Types.ObjectId(req.params.id);

    async.parallel({
        genre: (callback)=>{
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: (callback)=>{
            Book.find({'genre':req.params.id}).exec(callback);
        },
    }, (err,results)=>{
        if (err) {
            return next(err);
        }
        if(results.genre==null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail',{title:'Genre detail',genre: results.genre, genre_books:results.genre_books});
    });
};

exports.genre_create_get = (req,res) =>{
    res.render('genre_form',{title:'Create genre'});
};

exports.genre_create_post = [
    /* body() validates and sanitises the field,
    trim() remove any trailing/leading whitespace &
    escape() remove any dangerous HTML characters. */
    body('name','Genre name is required').trim().isLength({min:1}).escape(),

    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req);

        var genre = new Genre({name: req.body.name});

        if(!errors.isEmpty()){ 
            // there are errors. Render the form again with sanitized values/error messages
            res.render('genre_form',{title:'Create genre', genre: genre, errors: errors.array()});
            return;
        } else { 
            //data from form is valid
            Genre.findOne({'name':req.body.name}).exec((err,found_genre)=>{
                if (err) return next(err);
                if(found_genre){
                    // it found the genre with the same name and redirect to its detail page.
                    res.redirect(found_genre.url);
                } else {
                    // save the new genre in the bank and redirect to its detail page.
                    genre.save((err)=>{
                        if (err) return next(err);
                        res.redirect(genre.url);
                    });
                }
            });
        }

    }
];


exports.genre_delete_get = (req,res,next) =>{
    async.parallel({
        genre: (callback)=>{
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: (callback)=>{
            Book.find({'genre':req.params.id}).exec(callback);
        },
    }, (err,results)=>{
        if (err) {
            return next(err);
        }
        if(results.genre==null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_delete',{title:'Genre delete',genre: results.genre, genre_books:results.genre_books});
    });
};

exports.genre_delete_post = (req,res,next) =>{
    async.parallel({
        genre: (callback) => {
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: (callback) =>{
            Book.find({'genre':req.body.genreid}).exec(callback);
        }
    }, (err, results) => {
        if(err) return next(err);
        if(results.genre_books.length>0){
            res.render('genre_delete',{title:'Genre delete',genre: results.genre, genre_books:results.genre_books});
            return;
        } else {
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err){
                if (err) return next(err);
                res.redirect('/catalog/genres');
            });
        }
    });
};

exports.genre_update_get = (req,res,next) =>{
    Genre.findById(req.params.id).exec((err,genre)=>{
        if(err) {return next(err);}
        if(genre==null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_form', {title:'Update genre', genre: genre});
    });
};

exports.genre_update_post = [
    body('name','Genre name is required').trim().isLength({min:1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var genre = new Genre({name: req.body.name, _id: req.params.id});
        if(!errors.isEmpty()){ 
            res.render('genre_form',{title:'Update genre', genre: genre, errors: errors.array()});
            return;
        } else {
            Genre.findOne({'name':req.body.name}).exec((err,found_genre)=>{
                if (err) return next(err);
                if(found_genre){
                    res.redirect(found_genre.url);
                } else {
                    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err,thegenre)=>{
                        if(err) return next(err);
                        res.redirect(thegenre.url);
                    });
                }
            });
        }
    }
];

