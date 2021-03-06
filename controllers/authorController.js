var Author = require('../models/author');
var Book = require('../models/book');
//nao sei mano
const author = require('../models/author');
async= require('async');
const {body, validationResult} = require('express-validator');

exports.author_list = (req,res,next)=>{
    //sort() ordenou em ordem alfabetica pelo family
    Author.find().sort([['family_name','ascending']]).exec((err,list_author)=>{
        if (err) next(err);
        res.render('author_list',{title:'Author list', author_list:list_author});
    })
};

exports.author_detail = (req,res,next)=>{
    async.parallel({
        author: (callback)=>{
            Author.findById(req.params.id).exec(callback);
        },
        author_books: (callback) =>{
            Book.find({'author':req.params.id},'title summary').exec(callback);
        }
    }, (err, results)=>{
        if(err) return next(err);
        if(results.author==null){
            var err = new Error ('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail',{title: 'Author detail', author: results.author, author_books: results.author_books});
    });
};

exports.author_create_get = (req,res)=>{
    res.render('author_form',{title:'Create Author'});
};

exports.author_create_post = [
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    
    body('family_name').trim().isLength({min:1}).escape().withMessage('Family name must be specified')
    .isAlphanumeric().withMessage('Family has non-alphanumeric characters'),

    body('date_of_birth','Invalid date of birth').optional({checkFalsy:true}).isISO8601().toDate(),
    body('date_of_death','Invalid date of birth').optional({checkFalsy:true}).isISO8601().toDate(),
    (req,res,next)=>{
        // extract the validation errors from a request
        const errors = validationResult(req);
        var author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        });
        if (!errors.isEmpty()){
            //there are errors
            res.render('author_form',{title: 'Create author', author:author, errors: errors.array()});
            return;
        } else {
            author.save((err)=>{
                if (err) return next(err);
                res.redirect(author.url);
            });
        }
    }
];

exports.author_delete_get = (req,res,next)=>{
    //console.log(req.params);
    async.parallel({
        author: (callback) => {
            Author.findById(req.params.id).exec(callback)
        },
        author_books: (callback) => {
            Book.find({'author':req.params.id}).exec(callback)
        },
    }, (err, results) => {
        if (err) return next(err);
        if(results.author==null) res.redirect('catalog/authors');
        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books});
    });
};

exports.author_delete_post = (req,res,next)=>{
    async.parallel({
        author: (callback) => {
            Author.findById(req.body.authorid).exec(callback)
        },
        author_books: (callback) => {
            Book.find({'author':req.body.authorid}).exec(callback)
        },
    }, (err, results) => {
        if (err) return next(err);
        if(results.author_books.length > 0) {
            res.render('author_delete',{title:'Delete Author', author: results.author, author_books: results.author_books});
            return;
        } else {
            //author has no books
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err){
                if (err) return next(err);
                res.redirect('/catalog/authors');
            });
        }
    });
};

//var debug = require('debug')('author');
exports.author_update_get = (req,res,next)=>{
    Author.findById(req.params.id).exec((err, author)=>{
        if(err) {
            //debug('update error: ' + err);
            return next(err);
        }
        if(author==null){
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_form', {title:'Update author',author: author});
    });
};

exports.author_update_post = [
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    
    body('family_name').trim().isLength({min:1}).escape().withMessage('Family name must be specified')
    .isAlphanumeric().withMessage('Family has non-alphanumeric characters'),

    body('date_of_birth','Invalid date of birth').optional({checkFalsy:true}).isISO8601().toDate(),
    body('date_of_death','Invalid date of birth').optional({checkFalsy:true}).isISO8601().toDate(),
    (req,res,next)=>{
        const errors = validationResult(req);
        var author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id
        });
        if (!errors.isEmpty()){
            res.render('author_form',{title: 'Update author', author:author, errors: errors.array()});
            return;
        } else {
            Author.findByIdAndUpdate(req.params.id, author, {}, (err, theauthor) => {
                if (err) return next(err);
                res.redirect(theauthor.url);
            });
        }
    }
];