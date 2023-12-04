const express:any = require("express")
const path = require("path")
const app= express()
const mysql= require("mysql2")
require("dotenv").config()
const {graphqlHTTP}= require("express-graphql")
const { GraphQLObjectType,GraphQLSchema, 
GraphQLList,GraphQLString,GraphQLInt}= require("graphql")
const graphql= require("graphql")
const cors= require("cors")
const bcrypt= require("bcrypt")
const ejs= require("ejs")



// const sqlconnect= async()=>{

const connection = mysql.createPool({host:"localhost",user:"root",password:process.env.PWRD,database:"sqlgql",waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0})

  const pool:any = connection.promise()

const UserType:any =  new GraphQLObjectType({name:"Users",
fields:()=>({
  id:{type:GraphQLInt},
    name:{type:GraphQLString},
    email:{type:GraphQLString},
    password:{type:GraphQLString}
})})
let PostType=  new GraphQLObjectType({name:"Posts",
fields:()=>({
  cid:{type:GraphQLInt},
  postid:{type:GraphQLInt},
    comment:{type:GraphQLString}
    
})})

  let schema= new GraphQLSchema({query: new GraphQLObjectType({
    name:"query",
    fields:()=>({
        users:{type:new GraphQLList(UserType),
        resolve:async()=>{
          const query={text:"SELECT * FROM users"} 
         const [rows, fields] = await pool.query(query.text)
        return rows}},
        posts:{type:new GraphQLList(PostType),
        resolve:async()=> {
          const query ={text:"SELECT * FROM posts"}
          const [rows, fields]= await pool.query(query.text)
        return rows}},
        getposts:{type:new GraphQLList(PostType),
                   resolve:async()=>{
                    const query={text:"SELECT * FROM posts"}
                  const [rows, fields]= await pool.query(query.text)
                return rows }},
          getusers:{type:new GraphQLList(UserType),
             resolve:async()=>{
              const query = {text:"SELECT * FROM users"}
               const [rows, fields]= await pool.query(query.text)
               return rows
            }},
              getpost:{type:new GraphQLList(PostType),
                args:{postid:{type:GraphQLInt}},
             resolve:async(parent:any,args:any,context:any)=>{
              const{postid}= args
              const query= {text:"SELECT * FROM  posts WHERE postid=? ", values:[postid]}
             const [rows, fields]= await pool.query(query.text, query.values)
            return rows}},
            loguser:{type:UserType,
                  args:{name:{type:GraphQLString},
                  email:{type:GraphQLString},
                  password:{type:GraphQLString}},
                  resolve:async(parent:any,args:any,context:any)=>{
                    let {name,email,password}= args

                    // let salt =await bcrypt.genSalt(10)
                    // let hashp= await bcrypt.hash(password,salt)
                    // password= hashp
                    let [rows, fields]= await pool.query("SELECT * FROM users")
                  const singuser=  rows.find((item:any)=>item.email===email)
                  let compared
                  if (singuser) {
                    
                 compared= await bcrypt.compare(password, singuser.password)
                 if (compared) {
                  console.log(compared)
                  return {name,email}
                  
                 }
                  }
                  // return {name,email,password}
                    
                  }},
              getuser:{type:UserType,
                args:{id:{type:GraphQLInt}},
                    resolve:async(args:any)=>{
                 const{id}= args
                 const query= {text:"SELECT * FROM users WHERE id=?", values:[id]}
                const [rows, fields]= await pool.query(query.text, query.values)
                return rows
    }}
    })
  }),
mutation: new GraphQLObjectType({name:"mutation",
fields:()=>({
    
    createuser:{type:UserType,
      args:{name:{type:GraphQLString},
            email:{type:GraphQLString},
           password:{type:GraphQLString}},
                resolve:async(parent:any,args:any,context:any)=>{
                    let {name,email,password}= args
                    let salt =await bcrypt.genSalt(10)
                    let hashp= await bcrypt.hash(password,salt)
                    password= hashp
                    console.log(password)
                    let [rows, fields]= await pool.query("SELECT * FROM users")
                  const singuser=  rows.find((item:any)=>item.email===email)
                  if (!singuser) {
                    
                //  const compared= await bcrypt.compare(singuser.password, password)
                //  if (compared) {
                //   return name
                  
                //  }
                                 const query = {text:"INSERT INTO users (name,email,password) VALUES(?,?,?)",values:[name,email,password]}
             await pool.query(query.text, query.values)
          return {name,email,password}
                  }

          //         else{
          //                   const query = {text:"INSERT INTO users (name,email,password) VALUES(?,?,?)",values:[name,email,password]}
          //    await pool.query(query.text, query.values)
          // return {name,email,password}
          //         }


          //         const query = {text:"INSERT INTO users (name,email,password) VALUES(?,?,?)",values:[name,email,password]}
          //    await pool.query(query.text, query.values)
          // return {name,email,password}
        }},
    
    createpost:{type:PostType,
      args:{postid:{type:GraphQLInt},
        comment:{type:GraphQLString}
            },
                resolve:async(parent:any, args:any, context:any)=>{
                  const {postid,comment}= args
                  const query= {text: "INSERT INTO posts (postid,comment) VALUES(?,?)", values:[postid,comment]}
             const [rows, fields]= await pool.query(query.text, query.values)
            return {comment,postid}}},
    
})
})})


// sqlconnect()


app.use(cors())

app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "views"));
// // app.use(express.static(__dirname + '/build'))
// // app.use('/static', express.static(path.join(__dirname, 'build')))
app.use(express.static('../reactsg/build'))

app.get('/', (req:any, res:any) => {
  // Render your EJS template
  res.render('index.ejs');
});

app.use("/graphql",graphqlHTTP({graphiql:true,
schema}) )













app.listen(4000, ()=>console.log("listening on port 4000"))

//  C:\Program Files\MySQL/MySQL Server 8.0/bin
// CREATE DATABASE sqlgql;

//  USE sqlgql;

// CREATE TABLE users(
//     id  INT PRIMARY KEY AUTO_INCREMENT,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255)  UNIQUE NOT NULL,
//     password VARCHAR(90) NOT NULL
// );

// CREATE TABLE posts(
//    cid INT PRIMARY KEY AUTO_INCREMENT,
//     comment TEXT NOT NULL,
//     postid INT,
//     FOREIGN KEY (postid) REFERENCES users(id)
//     );

// i am writing to ask for extension of payment 
// deadline on my accounti in response to your mail of 
// an impending suspension of my account due to unpaid 
// charges. i got aware of the unpaid charges last two
//  weeks after months of not signing into my AWS account
//   and not checking my mails, you can check my 
//   login history between july and september to 
//   confirm this. i want to let you know that i am
//    making effort through my bank to
//  settle the dues and just ask for more time from you to get it sorted 



