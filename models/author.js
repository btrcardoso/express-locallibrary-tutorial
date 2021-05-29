var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {DateTime} = require('luxon');

var AuthorSchema = new Schema ({
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

//DON'T USE ARRAY FUNCTION IN OBJECTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!

AuthorSchema.virtual('name').get(function(){
    return this.family_name.toUpperCase() + ', ' + this.first_name;
});

AuthorSchema.virtual('lifespan').get(function(){
    var lifetime_string;
    lifetime_string= (this.date_of_birth) ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED):''; 
    lifetime_string+= ' - ';
    lifetime_string+= (this.date_of_death) ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED):''; 
    return lifetime_string;
});

AuthorSchema.virtual('date_of_birth_yyyy_mm_dd').get(function() {
    return DateTime.fromJSDate(this.date_of_birth).toISODate(); //format 'YYYY-MM-DD'
});
  
AuthorSchema.virtual('date_of_death_yyyy_mm_dd').get(function() {
    return DateTime.fromJSDate(this.date_of_death).toISODate(); //format 'YYYY-MM-DD'
});

AuthorSchema.virtual('url').get(function(){
    return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);
