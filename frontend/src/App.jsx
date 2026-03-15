import { useState } from "react"
import {
FaWallet,
FaArrowDown,
FaArrowUp,
FaPiggyBank,
FaHandHoldingUsd,
FaEye,
FaEyeSlash
} from "react-icons/fa"

export default function App(){

const [page,setPage] = useState("login")
const [phone,setPhone] = useState("")
const [balance,setBalance] = useState(0)
const [hideBalance,setHideBalance] = useState(false)

const API="https://your-backend-url.onrender.com"

/* LOGIN */

const login = async()=>{

const res = await fetch(`${API}/wallet/${phone}`)
const data = await res.json()

setBalance(data.balance)
setPage("dashboard")

}

/* PAYSTACK DEPOSIT */

const deposit = (amount)=>{

let handler = window.PaystackPop.setup({

key:"YOUR_PAYSTACK_PUBLIC_KEY",

email:`user${phone}@fintech.com`,

amount:amount*100,

currency:"KES",

metadata:{
custom_fields:[
{
display_name:"Phone",
variable_name:"phone",
value:phone
}
]
},

callback:function(){

loadWallet()

alert("Deposit successful")

},

onClose:function(){

alert("Payment cancelled")

}

})

handler.openIframe()

}

const loadWallet = async()=>{

const res = await fetch(`${API}/wallet/${phone}`)
const data = await res.json()

setBalance(data.balance)

}

/* LOGIN PAGE */

if(page==="login"){

return(

<div style={styles.loginPage}>

<div style={styles.loginCard}>

<h2>Lock Savings</h2>

<input
placeholder="Phone number"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
style={styles.input}
/>

<button onClick={login} style={styles.primaryBtn}>
Login
</button>

</div>

</div>

)

}

/* DEPOSIT PAGE */

if(page==="deposit"){

return(

<div style={styles.container}>

<h2>Deposit Money</h2>

<button
style={styles.depositBtn}
onClick={()=>deposit(20)}
>
Deposit KES 20
</button>

<button
style={styles.depositBtn}
onClick={()=>deposit(50)}
>
Deposit KES 50
</button>

<button
style={styles.depositBtn}
onClick={()=>deposit(100)}
>
Deposit KES 100
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

<div style={styles.container}>

<h2>Withdraw</h2>

<input placeholder="Amount" style={styles.input}/>
<input placeholder="M-Pesa Phone" style={styles.input}/>

<button style={styles.primaryBtn}>
Request Withdrawal
</button>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}

/* SAVINGS PAGE */

if(page==="savings"){

return(

<div style={styles.container}>

<h2>Savings Goals</h2>

<input placeholder="Goal name" style={styles.input}/>
<input placeholder="Target amount" style={styles.input}/>

<button style={styles.primaryBtn}>
Create Goal
</button>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}

/* LOANS PAGE */

if(page==="loans"){

return(

<div style={styles.container}>

<h2>Loans</h2>

<button style={styles.loanBtn}>Borrow KES 500</button>
<button style={styles.loanBtn}>Borrow KES 1000</button>
<button style={styles.loanBtn}>Borrow KES 2000</button>

<button onClick={()=>setPage("dashboard")}>
Back
</button>

</div>

)

}

/* DASHBOARD */

return(

<div style={styles.container}>

<div style={styles.balanceCard}>

<FaWallet size={30} color="white"/>

<div>

<p style={{color:"#eee"}}>Wallet Balance</p>

<h2 style={{color:"white"}}>

{hideBalance ? "******" : `KES ${balance}`}

</h2>

</div>

<button
onClick={()=>setHideBalance(!hideBalance)}
style={styles.eyeBtn}
>

{hideBalance ? <FaEye/> : <FaEyeSlash/>}

</button>

</div>

<div style={styles.grid}>

<button
style={styles.card}
onClick={()=>setPage("deposit")}
>

<FaArrowDown size={28} color="#2ecc71"/>

<p>Deposit</p>

</button>

<button
style={styles.card}
onClick={()=>setPage("withdraw")}
>

<FaArrowUp size={28} color="#e74c3c"/>

<p>Withdraw</p>

</button>

<button
style={styles.card}
onClick={()=>setPage("savings")}
>

<FaPiggyBank size={28} color="#f1c40f"/>

<p>Savings</p>

</button>

<button
style={styles.card}
onClick={()=>setPage("loans")}
>

<FaHandHoldingUsd size={28} color="#9b59b6"/>

<p>Loans</p>

</button>

</div>

</div>

)

}

/* STYLES */

const styles={

container:{
padding:20,
fontFamily:"Arial",
background:"#f5f7fb",
minHeight:"100vh"
},

loginPage:{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh",
background:"#1e88e5"
},

loginCard:{
background:"white",
padding:30,
borderRadius:10,
width:300
},

input:{
width:"100%",
padding:12,
marginBottom:10,
borderRadius:6,
border:"1px solid #ccc"
},

primaryBtn:{
background:"#1e88e5",
color:"white",
padding:12,
border:"none",
width:"100%",
borderRadius:6
},

balanceCard:{
background:"#1e88e5",
padding:20,
borderRadius:12,
display:"flex",
justifyContent:"space-between",
alignItems:"center"
},

eyeBtn:{
background:"transparent",
border:"none",
color:"white"
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:15,
marginTop:20
},

card:{
background:"white",
border:"none",
borderRadius:12,
padding:25,
boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
display:"flex",
flexDirection:"column",
alignItems:"center"
},

depositBtn:{
padding:14,
background:"#27ae60",
color:"white",
border:"none",
width:"100%",
marginBottom:10,
borderRadius:6
},

loanBtn:{
padding:12,
background:"#9b59b6",
color:"white",
border:"none",
width:"100%",
marginBottom:10,
borderRadius:6
}

}
