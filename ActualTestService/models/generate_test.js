import _ from 'lodash';
import collections from '../configs/db'

export default class GenerateTest {
    constructor(app){
        this.app = app;
    }

    async generateTest(){

        // this.app.db.collections(collections.collections.manage_question_quantity).find()
        //         .then(res=>{
        //             console.log(res)
        //         })
        //         .catch(err=>{
        //             console.log(err)
        //             throw err;
        //         })

        //generate test for level 1
        let quantity_question_part1;
        let quantity_question_part2;
        let quantity_question_part3;
        let quantity_question_part4;
        let quantity_question_part5;
        let quantity_question_part6;
        let quantity_question_part7;
    }
}