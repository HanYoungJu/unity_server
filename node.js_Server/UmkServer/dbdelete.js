
exports.deletemongo=function (par1){
var Client = require('mongodb').MongoClient;

Client.connect('mongodb://localhost:27017/mongodb_tut', function(error, db){
    if(error) {
        console.log(error);
    } else {
        // 1. 입력할 document 생성
        var query={name:par1}
       // var michael = {name:'hosigi', age:122, gender:'M'};
        const db1 = db.db('mongodb_tut');
        // 2. student 컬렉션의 insert( ) 함수에 입력
        db1.collection('example').remove(query,function(err,removed){
            if(err){
                console.log(err);
            }else{
                console.log('removed successfully!');
            }

        });

        db.close();
    }
});
}