import express from "express"
import axios from "axios"
import cors from "cors"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 10000
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET

const walletsFile = "./wallets.json"
const paymentsFile = "./payments.json"
const withdrawalsFile = "./withdrawals.json"
const loansFile = "./loans.json"


/* WALLET BALANCE */

app.get("/wallet/:phone",(req,res)=>{

const phone = req.params.phone

let wallets = {}

if(fs.existsSync(walletsFile)){
wallets = JSON.parse(fs.readFileSync(walletsFile))
}

res.json({balance:wallets[phone] || 0})

})


/* VERIFY PAYMENT */

app.get("/verify/:reference",async(req,res)=>{

const reference = req.params.reference

try{

const response = await axios.get(
`https://api.paystack.co/transaction/verify/${reference}`,
{
headers:{Authorization:`Bearer ${PAYSTACK_SECRET}`}
}
)

const data = response.data.data

if(data.status !== "success"){
return res.json({success:false})
}

let wallets = {}

if(fs.existsSync(walletsFile)){
wallets = JSON.parse(fs.readFileSync(walletsFile))
}

const phone = data.metadata.phone
const amount = data.amount/100

if(!wallets[phone]) wallets[phone]=0

wallets[phone]+=amount

fs.writeFileSync(walletsFile,JSON.stringify(wallets,null,2))

let payments=[]

if(fs.existsSync(paymentsFile)){
payments = JSON.parse(fs.readFileSync(paymentsFile))
}

payments.push({phone,amount,reference})

fs.writeFileSync(paymentsFile,JSON.stringify(payments,null,2))

res.json({success:true,amount})

}catch(err){

console.log(err.message)
res.json({success:false})

}

})


/* WITHDRAW REQUEST */

app.post("/withdraw",(req,res)=>{

const {phone,amount}=req.body

let withdrawals=[]

if(fs.existsSync(withdrawalsFile)){
withdrawals = JSON.parse(fs.readFileSync(withdrawalsFile))
}

withdrawals.push({
phone,
amount,
status:"pending"
})

fs.writeFileSync(withdrawalsFile,JSON.stringify(withdrawals,null,2))

res.json({success:true})

})


/* LOAN REQUEST */

app.post("/loan",(req,res)=>{

const {phone,amount}=req.body

let loans=[]

if(fs.existsSync(loansFile)){
loans = JSON.parse(fs.readFileSync(loansFile))
}

loans.push({
phone,
amount,
status:"pending"
})

fs.writeFileSync(loansFile,JSON.stringify(loans,null,2))

res.json({success:true})

})


app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
