import express from "express"
import axios from "axios"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 10000
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

/* DATABASE FILES */

const walletFile = "./wallets.json"
const txFile = "./transactions.json"

/* LOAD FILE */

function readFile(file){
if(!fs.existsSync(file)) return []
return JSON.parse(fs.readFileSync(file))
}

function saveFile(file,data){
fs.writeFileSync(file,JSON.stringify(data,null,2))
}

/* WALLET BALANCE */

app.get("/wallet/:phone",(req,res)=>{

const wallets = readFile(walletFile)

const phone = req.params.phone

const wallet = wallets.find(w=>w.phone===phone)

res.json({balance: wallet?.balance || 0})

})

/* PAYSTACK INIT */

app.post("/deposit",async(req,res)=>{

const {phone,amount} = req.body

try{

const email = `user${phone}@fintech.com`

const response = await axios.post(
"https://api.paystack.co/transaction/initialize",
{
email,
amount:amount*100,
callback_url:"https://yourdomain.com/verify",
metadata:{phone}
},
{
headers:{
Authorization:`Bearer ${PAYSTACK_SECRET}`
}
}
)

res.json(response.data.data)

}catch(err){

console.log(err)

res.status(500).json({error:"payment failed"})

}

})

/* VERIFY PAYMENT */

app.get("/verify",async(req,res)=>{

const reference = req.query.reference

try{

const response = await axios.get(
`https://api.paystack.co/transaction/verify/${reference}`,
{
headers:{
Authorization:`Bearer ${PAYSTACK_SECRET}`
}
}
)

const payment = response.data.data

if(payment.status !== "success"){

return res.send("payment failed")

}

const phone = payment.metadata.phone
const amount = payment.amount/100

/* UPDATE WALLET */

let wallets = readFile(walletFile)

let wallet = wallets.find(w=>w.phone===phone)

if(!wallet){

wallet = {phone,balance:0}

wallets.push(wallet)

}

wallet.balance += amount

saveFile(walletFile,wallets)

/* SAVE TRANSACTION */

let tx = readFile(txFile)

tx.push({
phone,
amount,
reference,
type:"deposit",
date:new Date()
})

saveFile(txFile,tx)

res.send(`
<h2>Payment successful</h2>
<p>KES ${amount} added to wallet</p>
<a href="/">Back</a>
`)

}catch(err){

console.log(err)

res.send("verification failed")

}

})

app.listen(PORT,()=>{

console.log("Fintech server running",PORT)

})
