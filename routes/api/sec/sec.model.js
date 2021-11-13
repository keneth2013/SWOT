var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
const bcrypt = require("bcryptjs");

const mailSender = require("../../../utils/mailer");

  
var _db;

class Sec {
  secColl = null;
  secColl2 = null;
  constructor() {
    this.initModel();
  }
  async initModel() {
    try {
      
      _db = await conn.getDB();
      this.secColl = await _db.collection("user");
      this.secColl2 = await _db.collection("temp");

    } catch (ex) {
      
      console.log(ex);
      process.exit(1);
    
    }
  }

  async createNewUser( email, password) {
    try {
      let user = {
        email: email,
        password: await bcrypt.hash(password, 10),
        lastlogin: null,
        lastpasswordchange: null,
        passwordexpires: new Date().getTime() + (90 * 24 * 60 * 60 * 1000), 
        oldpasswords: [],
        roles: ["public"]
      }
      let result = await this.secColl.insertOne(user);
      //console.log(result);
      return result;
    } catch(ex) {
      console.log(ex);
      throw(ex);
    }
  }

  async sendTempToken ( email,token) {

    try {
      
      let temp = {
        email: email,
        tempTok: await bcrypt.hash(token, 10),
        expTok: new Date().getTime() + 1800000
      }
  
      let resultToken = await this.secColl2.insertOne(temp);
      
      return resultToken;
  
    } catch (ex) {
      
      console.log(ex);
      throw(ex);
  
    }
  
  }

  async getByEmail( email){

    const filter = {"email": email};
    return await this.secColl.findOne(filter);

  }

  async comparePassword ( rawPassword, dbPassword){
   
      return await bcrypt.compare(rawPassword, dbPassword);
 
  }

  async getByEmailToken( email){

    const filter2 = {"email": email};
    return await this.secColl2.findOne(filter2);

  }

  async compareToken(rawToken, dbToken, time){

    const timeNow = new Date().getTime();

    if(time > timeNow){
 
      return await bcrypt.compare(rawToken,dbToken);

    }else{

      return false;

    }

  }

  async updatePass( id, newpass){
    
    try {

      const filter = {"_id": new ObjectID(id)};
      newpass = await bcrypt.hash(newpass, 10);
      let updateJson = {'$set':{'password': newpass}};

      let result = await this.secColl.updateOne(filter, updateJson);  

      return result;
    
    } catch (err) {
    
      console.log(err);
      throw(err);
    
    }
    

  }

  
}

module.exports = Sec;
