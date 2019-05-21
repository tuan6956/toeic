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
                d.resolve({
                    paragraphs: result_insert_paragraph,
                    questions: result_insert_question,
                    level: result_insert_paragraph.level,
                    part: result_insert_paragraph.part
                })
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
                                delete result.paragraph;
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
                result_insert_question = result_insert_question.map(item=>{
                    return {
                        id: item._id,
                        question: item.question_content

                    }
                })
                d.resolve({
                    paragraph: result_insert_paragraph,
                    questionObjects: result_insert_question,
                    part: result_insert_paragraph.part,
                    level: result_insert_paragraph.level
                })
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

        let part = await this.getQuestionById(_id).then(res=>{
            return res.part;
        })
        .catch(err=>{
            return err.toString();
            console.log(err)
        })
        if(!_.isInteger(part)){
            console.log(_.isInteger(part))
            d.reject({
                status: 500,
                message: part
            })
            return d.promise;
        }
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
            
                this.mongoModels.updateRecord(collections.reading_question,{_id: _id}, data_update)
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
            case 7:{
                let data_update = new Object();
                let answers = _.get(data, 'answers')
                if(answers){
                    if(answers.optA){
                        data_update['answers.optA'] = answers.optA;
                    }
                    if(answers.optB){
                        data_update['answers.optB'] = answers.optB;
                    }
                    if(answers.optC){
                        data_update['answers.optC'] = answers.optC;
                    }
                    if(answers.optD){
                        data_update['answers.optD'] = answers.optD;
                    }
                    
                }
                else{data_update = data}
            
                this.mongoModels.updateRecord(collections.reading_question,{_id: _id}, data_update)
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
            
            default:
                break;
        }
    }
}