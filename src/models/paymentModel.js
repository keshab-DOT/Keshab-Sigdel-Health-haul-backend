import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    paymentMethod: { type: String, enum: ['cod', 'khalti', 'esewa'], default: 'cod' },
    totalAmount :{type:Number, required:true},
    paymentStatus : {type :String},
    pidx :{type :String, default:null}
},{timestamps:true})

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment
