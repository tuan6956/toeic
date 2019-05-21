const q = require('q');
const { collections } = require('../configs/db');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');
import MongoModel from '../database/mongoModel';
// var mongoModel = new MongoModel();

export default class ListeningQuestion {

    constructor(app){
        this.app = app;
        this.mongoModels = new MongoModel(app);
    }

    async importQuestion(data){
        const d = q.defer();
        let part = _.get(data, "part");
        let level = _.get(data, "level");

        switch(part) {
            case 1:{
                this.mongoModels.insertRecord(collections.listening_question, data)
                            .then(result => {
                                // delete result.image_link;
                                // delete result.answers;
                                delete result.right_answer;
                                delete result.explain;
                                d.resolve(result);
                            })
                            .catch(err => {
                                d.reject({
                                    status: 500,
                                    message: err
                                });
                            })
                return d.promise;
            }
            case 2:{
                this.mongoModels.insertRecord(collections.listening_question, data)
                    .then(result => {
                        // delete result.audio_link;
                        // delete result.answers;
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
            case 3:{
                let dialogue = {
                    dialogue_link: data.dialogue_link,
                    level: data.level,
                    part: data.part
                }

                let questionObjects = _.get(data, "questionObjects")

                if(questionObjects.length < 3) {
                    d.reject({
                            status: 500,
                            message: "you need to import at least 3 questions"
                        });
                    return d.promise;
                }
                
                let result_insert_dialogue = await this.mongoModels.insertRecord(collections.dialogues, dialogue)
                            .then(result => {
                                delete result.dialogue_link;
                                return result;
                            })
                            .catch(err => {
                                console.log(err)
                                d.reject({
                                    status: 500,
                                    message: "Can not insert dialogue into database",
                                    err: err
                                });
                                return d.promise;
                            })
                questionObjects = questionObjects.map(item=>{
                    item.id_dialogue = result_insert_dialogue._id;
                    item.part = part;
                    item.level = level;
                    return item;
                })
                let result_insert_question = await Promise.all(questionObjects.map(item => this.mongoModels.insertRecord(collections.listening_question, item)))
                result_insert_question = result_insert_question.map(item=>{
                    return {
                        id: item._id,
                        question: item.question_content
    
                    }
                })
                d.resolve({
                    dialogue: result_insert_dialogue,
                    questionObjects: result_insert_question
                })
                return d.promise;
            }
            case 4:{
                let dialogue = {
                    dialogue_link: data.dialogue_link,
                    level: data.level,
                    part: data.part
                }

                let questionObjects = _.get(data, "questionObjects")

                if(questionObjects.length < 3) {
                    d.reject({
                            status: 500,
                            message: "you need to import at least 3 questions"
                        });
                    return d.promise;
                }
                
                let result_insert_dialogue = await this.mongoModels.insertRecord(collections.dialogues, dialogue)
                            .then(result => {
                                delete result.dialogue_link;
                                return result;
                            })
                            .catch(err => {
                                console.log(err)
                                d.reject({
                                    status: 500,
                                    message: "Can not insert dialogue into database",
                                    err: err
                                });
                                return d.promise;
                            })
                questionObjects = questionObjects.map(item=>{
                    item.id_dialogue = result_insert_dialogue._id;
                    item.part = part;
                    item.level = level;
                    return item;
                })
                let result_insert_question = await Promise.all(questionObjects.map(item => dbController.insert(collections.listening_question, item)))
                result_insert_question = result_insert_question.map(item=>{
                    return {
                        id: item._id,
                        question: item.question_content

                    }
                })
                d.resolve({
                    dialogue: result_insert_dialogue,
                    questionObjects: result_insert_question
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
    
    async getAll(page, limit, part){
        const d = q.defer();
        let options = {
            projection: { test_id: 1, level: 1, part: 1}
        }

        let question_part1 = await this.mongoModels.getAll(collections.listening_question, page, limit, {part: 1}, options).then(result=>{
            return result;
        })

        let question_part2 = await this.mongoModels.getAll(collections.listening_question, page, limit, {part: 2}, options).then(result=>{
            return result;
        })

       if(!_.isUndefined(part)){
           if (part === 1) {
               d.resolve(question_part1)
               return d.promise;
           }

           if (part === 2) {
               d.resolve(question_part2)
               return d.promise;
           }

           if (part === 3 || part === 4) {
               let questions = await this.mongoModels.getAll(collections.dialogues, page, limit, {part: part}, options).then(result =>{
                    return result;
                })
               d.resolve(questions);
               return d.promise;
           }
       }
        let questions = await this.mongoModels.getAll(collections.dialogues, page, limit,{}, options).then(result =>{
            return result;
        })
        
        let question_result = [...question_part1, ...question_part2, ...questions];
        d.resolve(question_result);
        return d.promise;
        
    }
    
    getQuestionById(id){
        id = ObjectId(id);
        const d = q.defer();
    
        this.mongoModels.findRecord(collections.listening_question, id)
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

    getDialogueById(id){
        id = ObjectId(id);
        const d = q.defer();
    
        let querry = [
            {$lookup:
               {
                 localField: "_id",
                 from: "listening_question",
                 foreignField: "id_dialogue",
                 as: "questions"
               }
            },
            {$match:{ _id: ObjectId(id)}},
            { $project: { questions: {level: 0, part: 0} } },
            
        ]
        this.mongoModels.aggregate_func(collections.dialogues, querry)
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
            case 1:{
            
                this.mongoModels.updateRecord(collections.listening_question,{_id: _id}, data_update)
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
            case 2: {
            
                this.mongoModels.updateRecord(collections.listening_question,{_id: _id}, data_update)
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
            case 3:{
            
                this.mongoModels.updateRecord(collections.listening_question,{_id: _id}, data_update)
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
            case 4:{
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
            
                    this.mongoModels.updateRecord(collections.listening_question,{_id: _id}, data_update)
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