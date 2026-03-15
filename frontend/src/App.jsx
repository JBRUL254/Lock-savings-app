import {useState,useEffect} from "react"
import {FaWallet,FaArrowDown,FaArrowUp,FaPiggyBank,FaHandHoldingUsd,FaEye,FaEyeSlash} from "react-icons/fa"

export default function App(){

const [page,setPage]=useState("dashboard")
const [phone,setPhone]=useState("")
const [balance,setBalance]=useState(0)
const [amount,setAmount]=useState("")
const [hide,setHide]=useState(false)

useEffect(()=>{
if(phone) loadWallet()
},[phone])

const loadWallet = async()=>{

const res = await fetch(`http://localhost:10000/wallet/${phone}`)
const data = await res.json()

setBalance(data.balance)

}


/* PAYSTACK DEPOSIT */

const deposit = ()=>{

const handler = window.PaystackPop.setup({

key:"pk_test_xxxxxxxxxxxxx",

email:`user${phone}@mail.com`,

amount:amount*100,

currency:"KES",

metadata:{
phone
},

callback:function(response){

verifyPayment(response.reference)

},

onClose:function(){
alert("Payment cancelled")
}

})

handler.openIframe()

}


/* VERIFY */

const verifyPayment = async(reference)=>{

const res = await fetch(`http://localhost:10000/verify/${reference}`)
const data = await res.json()

if(data.success){

alert("Wallet credited!")

loadWallet()

}

}


/* WITHDRAW */

const withdraw = async()=>{

await fetch("http://localhost:10000/withdraw",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({
phone,
amount
})

})

alert("Withdrawal request sent")

}


/* LOAN */

const loan = async()=>{

await fetch("http://localhost:10000/loan",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({
phone,
amount
})

})

alert("Loan request submitted")

}


if(!phone){

return(

<div style={{padding:40}}>

<h2>Lock Savings Login</h2>

<input
placeholder="Phone number"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>

</div>

)

}


/* DEPOSIT PAGE */

if(page==="deposit"){

return(

<div style={{padding:40}}>

<h2>Deposit</h2>

<input
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<button onClick={deposit}>
Deposit with Paystack
</button>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}


/* WITHDRAW PAGE */

if(page==="withdraw"){

return(

<div style={{padding:40}}>

<h2>Withdraw</h2>

<input
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<button onClick={withdraw}>
Request Withdrawal
</button>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}


/* SAVINGS */

if(page==="savings"){

return(

<div style={{padding:40}}>

<h2>Savings</h2>

<p>Create manual saving goals (UI placeholder)</p>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}


/* LOANS */

if(page==="loan"){

return(

<div style={{padding:40}}>

<h2>Loan</h2>

<input
placeholder="Loan amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<button onClick={loan}>
Apply Loan
</button>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}


/* DASHBOARD */

return(

<div style={{padding:40}}>

<h2>Lock Savings</h2>

<div>

<FaWallet/>

<h3>

{hide?"*****":`KES ${balance}`}

<button onClick={()=>setHide(!hide)}>

{hide?<FaEye/>:<FaEyeSlash/>}

</button>

</h3>

</div>

<div>

<button onClick={()=>setPage("deposit")}>
<FaArrowDown/> Deposit
</button>

<button onClick={()=>setPage("withdraw")}>
<FaArrowUp/> Withdraw
</button>

<button onClick={()=>setPage("savings")}>
<FaPiggyBank/> Savings
</button>

<button onClick={()=>setPage("loan")}>
<FaHandHoldingUsd/> Loans
</button>

</div>

</div>

)

}
