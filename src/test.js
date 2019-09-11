


// class Counter{
//     constructor(name){
//         this.name=name
//     }

//     showName(){
//         console.log(this.name)
//     }
// }


// let obj={
//     a:new Counter('张三'),
//     b:function (){
//         console.log('object')
//     }
// }

// function deepClone(obj){
//     if(typeof obj !=='object' ||  obj == null ) return obj;
    
//     let current= new obj.constructor();

//     for(let name in Object.getOwnPropertyDescriptors(obj)){
//         current[name]=deepClone(obj[name]);
//     }
//     return current
// }

// let newB =deepClone(obj);

// newB.a.name="李四"
// newB.a.showName();
// obj.a.showName();

// let c= JSON.parse(JSON.stringify(obj));

// console.log(c)





