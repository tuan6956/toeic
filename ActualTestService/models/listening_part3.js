const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');

export default class ListeningPart3 {
    
    async importQuestion(data){
        const d = q.defer();
        let part = _.get(data, "part");

        switch(part) {
            case 3:
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
                let result_insert_question = await Promise.all(questionObjects.map(item => dbController.insert(collections.listening_question_part3, item)))
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
            case 4:
              break;
            default:
                d.reject({
                        status: 500,
                        message: "Please check your data insert, field 'part' maybe wrong"
                    });
                return d.promise;
          }
    }
    
    getAll(page = 0, limit = 5){
        const d = q.defer();
    
        dbController.getAll(collections.listening_question_part3, page, limit)
                    .then(result => {
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
    
    getQuestionById(id){
        const d = q.defer();
    
        dbController.find(collections.listening_question_part3, id)
                    .then(result => {
                        d.resolve(result[0]);
                    })
                    .catch(err => {
                        d.reject({
                            status: 500,
                            message: "Can not get all question into database"
                        });
                    })
        return d.promise;
    }
    
    updateQuestionById(_id, data){
        _id = ObjectId(_id);
    
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
        console.log(data_update)
        const d = q.defer();
    
        dbController.update(collections.listening_question_part3, _id, data_update)
                    .then(result => {
                        d.resolve(result);
                    })
                    .catch(err => {
                        d.reject({
                            status: 500,
                            message: "Can not update question into database"
                        });
                    })
        return d.promise;
    }
}

// https://viblo.asia/q/asyncawait-foreach-for-o754DoEJ5M6
// https://medium.com/@bluepnume/even-with-async-await-you-probably-still-need-promises-9b259854c161