var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const {body, validationResult} = require('express-validator');
var async = require('async');
const { book_list } = require('./bookController');

exports.bookinstance_list = (req,res,next) =>{
    BookInstance.find().populate('book').exec((err,list_bookinstances)=>{
        if (err) next(err);
        res.render('bookinstance_list', {title:'Book Instances List', bookinstance_list: list_bookinstances});
    });
};

exports.bookinstance_detail = (req,res,next) =>{
    BookInstance.findById(req.params.id).populate('book').exec((err,bookinstance)=>{
        if(err) return next(err);
        if(bookinstance==null){
            var err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_detail',{title: 'Copy: '+bookinstance.book.title, bookinstance: bookinstance})
    });
};

exports.bookinstance_create_get = (req,res,next) =>{
    Book.find({},'title').exec((err,books)=>{
        if (err) return next(err);
        res.render('bookinstance_form',{title:'Create Book Instance', book_list:books});
    });
};

exports.bookinstance_create_post = [
    body('book','Book must be specified').trim().isLength({min:1}).escape(),
    body('imprint','Imprint must be specified').trim().isLength({min:1}).escape(),
    body('status').escape(),
    body('due_back','Invalide date').optional({checkFalsy:true}).isISO8601().toDate(),
    (req,res,next)=>{
        const errors = validationResult(req);
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });
        if(!errors.isEmpty()){
            //there are errors
            Book.find({},'title').exec((err,books)=>{
                if (err) return next(err);
                res.render('bookinstance_form',{title:'Create bookinstance', book_list:books, selected_book: bookinstance._id, errors: errors.array(), bookinstance:bookinstance});
            });
            return;
        } else {
            bookinstance.save((err)=>{
                if (err) return next(err);
                res.redirect(bookinstance.url);
            });
        }
    }
];

exports.bookinstance_delete_get = (req,res,next) =>{
    BookInstance.findById(req.params.id).populate('book').exec((err,bookinstance)=>{
        if(err) return next(err);
        if(bookinstance==null) res.redirect('/catalog/bookinstances');
        res.render('bookinstance_delete', {title:'Delete bookinstance: ', bookinstance: bookinstance});
    });
};

exports.bookinstance_delete_post = (req,res,next) =>{
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
        if (err) return next(err);
        res.redirect('/catalog/bookinstances');
    });
};

exports.bookinstance_update_get = (req,res,next) =>{
    async.parallel({
        book_list: (callback) => {
            Book.find(callback);
        },
        bookinstance: (callback) =>{
            BookInstance.findById(req.params.id).populate('book').exec(callback);
        },
    }, (err, results) => {
        if (err) return next(err);
        if(results.bookinstance==null){
            var err = new Error('Book instance not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_form', {title: 'Update Book Instance: ', book_list: results.book_list, bookinstance: results.bookinstance})
    });
};

exports.bookinstance_update_post = [
    body('book','Book must be specified').trim().isLength({min:1}).escape(),
    body('imprint','Imprint must be specified').trim().isLength({min:1}).escape(),
    body('status').escape(),
    body('due_back','Invalide date').optional({checkFalsy:true}).isISO8601().toDate(),
    (req,res,next)=>{
        const errors = validationResult(req);
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });
        if(!errors.isEmpty()){
            Book.find({},'title').exec((err,books)=>{
                if (err) return next(err);
                res.render('bookinstance_form',{title:'Create bookinstance', book_list:books, selected_book: bookinstance._id, errors: errors.array(), bookinstance:bookinstance});
            });
            return;
        } else {
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, (err, thebookinstance)=>{
                if (err) return next(err);
                res.redirect(thebookinstance.url);
            });
        }
    }
];

