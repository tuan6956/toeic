const q = require('q');
const { collections } = require('../configs/db');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');
import MongoModel from '../database/mongoModel';

export default class ReadingQuestion {

    constructor(app){
        this.app = app;
        this.mongoModels = new MongoModel(app);
    }

    async importQuestion(data){
        const d = q.defer();
        let part = _.get(data, "part");
        let level = _.get(data, "level");

        switch(part) {
            case 5:{
                this.mongoModels.insertRecord(collections.reading_question, data)
                    .then(result => {
                        delete result.right_answer;
                        delete result.explain;
                        d.resolve(result);
                    })
                    .catch(err => {
                        d.reject({
                            status: 500,
                            message: err.toString()
                        });
                    })
                return d.promise;
            }
            case 6:{
                let questions = _.get(data, "questions");
                if(_.isUndefined(questions)){
                    d.reject({
                        status: 500,
                        message: "questions is required"
                    })
                }
                let paragraph = [];
                questions = questions.map((item, index)=>{
                    paragraph.push(item.paragraph);
                    delete item.paragraph;
                    item.pos_in_paragraphs = index+1;
                    return item;
                })
                questions.pop();
                let result_insert_paragraph = await this.mongoModels.insertRecord(collections.paragraphs, new Object({"paragraphs":paragraph, "part": part, "level": level}))
                            .then(result => {
                                // delete result.paragraphs;
                                return result;
                            })
                            .catch(err => {
                                console.log(err, "error")
                                d.reject({
                                    status: 500,
                                    message: err.toString()
                                });
                                return d.promise;
                            })
                questions = questions.map(item=>{
                    item.id_paragraph = result_insert_paragraph._id;
                    item.part = part;
                    item.level = level;
                    return item;
                })

                let result_insert_question = await Promise.all(questions.map(item => this.mongoModels.insertRecord(collections.reading_question, item)))
                result_insert_question = result_insert_question.map(item=>{
                    return {
                        id: item._id,
                        question: item.question_content,
                        pos_in_paragraphs: item.pos_in_paragraphs,
                        level: item.level
                    }
                })
                result_insert_paragraph.questions = result_insert_question;
                d.resolve(result_insert_paragraph)
               
                return d.promise;
            }
            case 7:{
                let paragraph = {
                    paragraph: data.paragraph,
                    level: data.level,
                    part: data.part,
                    type: data.type
                }

                let questionObjects = _.get(data, "questionObjects")
                if(_.isUndefined(questionObjects)){
                    d.reject({
                        status: 500,
                        message: "questionObjects is required"
                    })
                }
                if(data.type === 1) {
                    if(questionObjects.length < 2 || questionObjects.length > 5) {
                        d.reject({
                                status: 500,
                                message: "you need to import at least 2 questions and at most 5 questions"
                            });
                        return d.promise;
                    }
                }
                else {
                    if(questionObjects.length !== 5) {
                        d.reject({
                                status: 500,
                                message: "you need to check quantity of questions. Just 5 questions"
                            });
                        return d.promise;
                    }
                }
                
                let result_insert_paragraph = await this.mongoModels.insertRecord(collections.paragraphs, paragraph)
                            .then(result => {
                                return result;
                            })
                            .catch(err => {
                                console.log(err)
                                d.reject({
                                    status: 500,
                                    message: err
                                });
                                return d.promise;
                            })
                questionObjects = questionObjects.map(item=>{
                    item.id_paragraph = result_insert_paragraph._id;
                    item.part = part;
                    item.level = level;
                    item.type = data.type;
                    return item;
                })
                let result_insert_question = await Promise.all(questionObjects.map(item => this.mongoModels.insertRecord(collections.reading_question, item)))
                result_insert_paragraph.questions = result_insert_question;
                d.resolve(result_insert_paragraph)
               
                return d.promise;
            }
            default:
                d.reject({
                        status: 500,
                        message: "Please check your data insert, field 'part' maybe wrong"
                    });
                return d.promise;
          }
    }
    
    async getAll(page = 0, limit = 0, part){
        const d = q.defer();

        let options = {
            projection: { test_id: 1, level: 1, part: 1}
        }

        let question_part5 = await this.mongoModels.getAll(collections.reading_question, page, limit, {part: 5}, options).then(result=>{
            return result;
        })

       if(!_.isUndefined(part)){
           if (part === 5) {
               d.resolve(question_part5)
               return d.promise;
           }
           if (part === 6 || part === 7) {
               let questions = await this.mongoModels.getAll(collections.paragraphs, page, limit, {part: part}, options).then(result =>{
                    return result;
                })
               d.resolve(questions);
               return d.promise;
           }
       }
        let questions = await this.mongoModels.getAll(collections.paragraphs, page, limit,{}, options).then(result =>{
            return result;
        })
        
        let question_result = [...question_part5, ...questions];
        d.resolve(question_result);
        return d.promise;
        
    }
    
    getQuestionById(id){
        id = ObjectId(id);
        const d = q.defer();
    
        this.mongoModels.findRecord(collections.reading_question, id)
                    .then(result => {
                        d.resolve(result[0]);
                    })
                    .catch(err => {
                        d.reject({
                            status: 500,
                            message: err.toString()
                        });
                    })
        return d.promise;
    }

    getParagraphById(id){
        id = ObjectId(id);
        const d = q.defer();
    
        let querry = [
            {$lookup:
               {
                 localField: "_id",
                 from: "reading_question",
                 foreignField: "id_paragraph",
                 as: "questions"
               }
            },
            {$match:{ _id: ObjectId(id)}},
            { $project: { questions: {level: 0, part: 0, id_paragraph: 0} } },
            
        ]
        this.mongoModels.aggregate_func(collections.paragraphs, querry)
                    .then(result => {
                        d.resolve(result[0]);
                    })
                    .catch(err => {
                        d.reject({
                            status: 500,
                            message: err.toString()
                        });
                    })
        return d.promise;
    }
    
    async updateQuestionById(_id, data){
        _id = ObjectId(_id);
        const d = q.defer();

        let part = _.get(data, 'part');

        switch(part){
            case 5:{
            
                this.mongoModels.updateRecord(collections.reading_question,{_id: _id}, data)
                            .then(result => {
                                d.resolve(result);
                            })
                            .catch(err => {
                                d.reject({
                                    status: 500,
                                    message: err.toString()
                                });
                            })
                return d.promise;
            }
            case 6:{
                let questions = _.get(data, "questions");
                let paragraph = {
                    paragraphs: data.paragraphs,
                    level: data.level,
                    part: data.part
                }

                if(_.isUndefined(questions)){
                    d.reject({
                        status: 500,
                        message: "questions is required"
                    })
                }


                let result_update_paragraph = await this.mongoModels.updateRecord(collections.paragraphs, {_id: _id}, paragraph)
                            .then(result => {
                                return result;
                            })
                            .catch(err => {
                                console.log(err, "error")
                                d.reject({
                                    status: 500,
                                    message: err.toString()
                                });
                                return d.promise;
                            })

                questions = questions.map(item=>{
                    item.part = data.part;
                    item.level = data.level;
                    return item;
                })

                let result_update_question = await Promise.all(questions.map(item => {
                        let item_id = item._id;
                        delete item._id;
                       return this.mongoModels.updateRecord(collections.reading_question, {_id: ObjectId(item_id)},item).then(res=>{
                            return res;
                        }).catch(err=>{
                            console.log(err)
                            d.reject({
                                status: 500,
                                message: err.toString()
                            });
                        })
                    }))
                result_update_paragraph.questions = result_update_question;
                d.resolve(result_update_paragraph)
                return d.promise;
            }
            case 7:{

                let paragraph = {
                    paragraph: data.paragraph,
                    level: data.level,
                    part: data.part,
                    type: data.type
                }

                let questionObjects = _.get(data, "questionObjects")
                if(_.isUndefined(questionObjects)){
                    d.reject({
                        status: 500,
                        message: "questionObjects is required"
                    })
                }
                if(data.type === 1) {
                    if(questionObjects.length < 2 || questionObjects.length > 5) {
                        d.reject({
                                status: 500,
                                message: "you need to check quantity of question at least 2 questions and at most 5 questions"
                            });
                        return d.promise;
                    }
                }
                else {
                    if(questionObjects.length !== 5) {
                        d.reject({
                                status: 500,
                                message: "you need to check quantity of questions. Just 5 questions"
                            });
                        return d.promise;
                    }
                }
                
                let result_update_paragraph = await this.mongoModels.updateRecord(collections.paragraphs, {_id: _id},paragraph)
                            .then(result => {
                                return result;
                            })
                            .catch(err => {
                                console.log(err)
                                d.reject({
                                    status: 500,
                                    message: err
                                });
                                return d.promise;
                            })

                questionObjects = questionObjects.map(item=>{
                    item.part = data.part;
                    item.level = data.level;
                    item.type = data.type;
                    return item;
                })

                let result_update_question = await Promise.all(questionObjects.map(item => {
                    let item_id = item._id;
                    delete item._id;
                    return this.mongoModels.updateRecord(collections.reading_question, {_id: ObjectId(item_id)},item)
                    .then(res =>{
                        return res
                    })
                    .catch(err =>{
                        console.log(err)
                    })
                }))

                result_update_paragraph.questionObjects = result_update_question;
                
                d.resolve(result_update_paragraph)
                return d.promise;
            }
            
            default:
                break;
        }
    }
}