const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');

export default class ListeningQuestion {
    
    async importQuestion(data){
        const d = q.defer();
        let part = _.get(data, "part");
        let level = _.get(data, "level");

        switch(part) {
            case 1:{
                dbController.insert(collections.listening_question, data)
                            .then(result => {
                                delete result.image_link;
                                delete result.answers;
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
            case 2:{
                dbController.insert(collections.listening_question, data)
                    .then(result => {
                        delete result.audio_link;
                        delete result.answers;
                        delete result.right_answer;
                        delete result.explain;
                        d.resolve(result);
                    })
                    .catch(err => {
                        d.reject({
                            status: 500,
                            message: "Can not insert question into database"
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
                
                let result_insert_dialogue = await dbController.insert(collections.dialogues, dialogue)
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
                
                let result_insert_dialogue = await dbController.insert(collections.dialogues, dialogue)
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
    
    getAll(page = 1, limit = 5, part){
        const d = q.defer();
        if(part) {
            dbController.getAll(collections.listening_question, page, limit, new Object({"part": part}))
                            .then(result => {
                                result = result.map(item=>{
                                    return {
                                        id: item._id,
                                        test_id: item.test_id ? item.test_id : null,
                                        level: item.level ? item.level : null,
                                        part: item.part
                                    }
                                })
                                d.resolve(result);
                            })
                            .catch(err => {
                                d.reject({
                                    status: 500,
                                    message: err.toString(),
                                });
                            })
                return d.promise;
        }else{
            dbController.getAll(collections.listening_question, page, limit)
                            .then(result => {
                                result = result.map(item=>{
                                    return {
                                        id: item._id,
                                        test_id: item.test_id ? item.test_id : null,
                                        level: item.level ? item.level : null,
                                        part: item.part
                                    }
                                })
                                d.resolve(result);
                            })
                            .catch(err => {
                                d.reject({
                                    status: 500,
                                    message: "Can not get all question into database"
                                });
                            })
                return d.promise;
        }
        
    }
    
    getQuestionById(id){
        id = ObjectId(id);
        const d = q.defer();
    
        dbController.find(collections.listening_question, id)
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
            
                dbController.update(collections.listening_question,{_id: _id}, data_update)
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
            
                dbController.update(collections.listening_question,{_id: _id}, data_update)
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
            
                dbController.update(collections.listening_question,{_id: _id}, data_update)
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
            
                dbController.update(collections.listening_question,{_id: _id}, data_update)
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

// https://viblo.asia/q/asyncawait-foreach-for-o754DoEJ5M6
// https://medium.com/@bluepnume/even-with-async-await-you-probably-still-need-promises-9b259854c161
// https://ehkoo.com/bai-viet/tat-tan-tat-ve-promise-va-async-await