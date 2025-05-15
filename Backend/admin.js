import mongoose from "mongoose";
const adminSchema=new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    password:String,
    address:String,
   slotData: [
    {
      date: String,
      totalSlots: Number,
      bookedSlots: Number,
    },
  ],
});
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;