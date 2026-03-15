import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

import {
FaWallet,
FaArrowDown,
FaArrowUp,
FaPiggyBank,
FaHandHoldingUsd,
FaEye,
FaEyeSlash
} from "react-icons/fa"

const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App(){

const [user,setUser] = useState(null)
const [profile,setProfile] = useState(null)
const [page,setPage] = useState("dashboard")

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [phone,setPhone] = useState("")
const [pin,setPin] = useState("")

const [hideBalance,setHideBalance] = useState(false)

const [transactions,setTransactions] = useState([])
const [savings,setSavings] = useState([])
const [loanRequests,setLoanRequests] = useState([])

const [goalName,setGoalName] = useState("")
const [targetAmount,setTargetAmount] = useState("")

const [withdrawAmount,setWithdrawAmount] = useState("")
const [withdrawPhone,setWithdrawPhone] = useState("")

/* AUTH */

const login = async()=>{

const {data,error} =
await supabase.auth.signInWithPassword({
email,
password
})

if(error){alert(error.message);return}

setUser(data.user)

}

const signup = async()=>{

const {data,error} =
await supabase.auth.signUp({
email,
password
})

if(error){alert(error.message);return}

await supabase.from("profiles").insert({
id:data.user.id,
email,
phone,
pin,
wallet_balance:0
})

alert("Account created")

}

const logout = async()=>{

await supabase.auth.signOut()
setUser(null)

}

/* LOAD DATA */

useEffect(()=>{

if(!user) return

loadProfile()
loadTransactions()
loadSavings()
loadLoans()

},[user])

const loadProfile = async()=>{

const {data} =
await supabase
.from("profiles")
.select("*")
.eq("id",user.id)
.single()

setProfile(data)

}

const loadTransactions = async()=>{

const {data} =
await supabase
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("created_at",{ascending:false})

setTransactions(data)

}

const loadSavings = async()=>{

const {data} =
await supabase
.from("savings")
.select("*")
.eq("user_id",user.id)

setSavings(data)

}

const loadLoans = async()=>{

const {data} =
await supabase
.from("loans")
.select("*")

setLoanRequests(data)

}

/* PAYSTACK DEPOSIT */

const deposit = (amount)=>{

let handler = window.PaystackPop.setup({

key:import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

email:profile.email,

amount:amount*100,

currency:"KES",

callback:function(response){

saveTransaction(amount,"deposit",response.reference)

alert("Deposit successful")

},

onClose:function(){

alert("Transaction cancelled")

}

})

handler.openIframe()

}

const saveTransaction = async(amount,type,reference)=>{

await supabase.from("transactions").insert({
user_id:user.id,
type,
amount,
status:"success",
reference
})

await supabase.rpc("update_wallet",{
uid:user.id,
amt:amount
})

loadProfile()
loadTransactions()

}

/* MPESA WITHDRAWAL REQUEST */

const withdraw = async()=>{

const res = await fetch("/withdraw",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
phone:withdrawPhone,
amount:withdrawAmount,
userId:user.id
})
})

if(res.ok){

alert("Withdrawal request sent")

}else{

alert("Withdrawal failed")

}

}

/* SAVINGS */

const createGoal = async()=>{

await supabase.from("savings").insert({
user_id:user.id,
goal_name:goalName,
target_amount:targetAmount,
saved_amount:0
})

alert("Goal created")

loadSavings()

}

/* LOANS */

const applyLoan = async(amount)=>{

await supabase.from("loans").insert({
user_id:user.id,
amount,
status:"pending"
})

alert("Loan request submitted")

}

/* ADMIN APPROVE LOAN */

const approveLoan = async(id,amount,userId)=>{

await supabase
.from("loans")
.update({status:"approved"})
.eq("id",id)

await supabase.rpc("update_wallet",{
uid:userId,
amt:amount
})

alert("Loan approved")

loadLoans()

}

/* LOGIN PAGE */

if(!user){

return(

<div style={styles.center}>

<div style={styles.card}>

<h2>Lock Savings</h2>

<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={styles.input}/>

<input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} style={styles.input}/>

<input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={styles.input}/>

<input type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} style={styles.input}/>

<button onClick={login} style={styles.primary}>Login</button>

<button onClick={signup} style={styles.secondary}>Create Account</button>

</div>

</div>

)

}

/* ADMIN DASHBOARD */

if(profile?.email === "admin@locksavings.com"){

return(

<div style={styles.container}>

<h2>Admin Dashboard</h2>

<h3>Loan Requests</h3>

{loanRequests.map(l=>(
<div key={l.id}>

User: {l.user_id}

Amount: {l.amount}

Status: {l.status}

{l.status==="pending" &&

<button onClick={()=>approveLoan(l.id,l.amount,l.user_id)}>
Approve
</button>

}

</div>
))}

</div>

)

}

/* PAGES */

if(page==="deposit"){

return(

<div style={styles.container}>

<h2>Deposit</h2>

<button onClick={()=>deposit(1000)}>Deposit KES 1000</button>

<button onClick={()=>setPage("dashboard")}>Back</button>

</div>

)

}

if(page==="withdraw"){

return(

<div style={styles.container}>

<h2>M-Pesa Withdrawal</h2>

<input placeholder="Phone" value={withdrawPhone} onChange={e=>setWithdrawPhone(e.target.value)} style={styles.input}/>

<input placeholder="Amount" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} style={styles.input}/>

<button onClick={withdraw}>Withdraw</button>

<button onClick={()=>setPage("dashboard")}>Back</button>

</div>

)

}

if(page==="savings"){

return(

<div style={styles.container}>

<h2>Savings Goals</h2>

<input placeholder="Goal name" value={goalName} onChange={e=>setGoalName(e.target.value)} style={styles.input}/>

<input placeholder="Target amount" value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} style={styles.input}/>

<button onClick={createGoal}>Create Goal</button>

<button onClick={()=>setPage("dashboard")}>Back</button>

</div>

)

}

if(page==="loans"){

return(

<div style={styles.container}>

<h2>Loans</h2>

<button onClick={()=>applyLoan(500)}>Loan KES 500</button>
<button onClick={()=>applyLoan(1000)}>Loan KES 1000</button>
<button onClick={()=>applyLoan(1500)}>Loan KES 1500</button>
<button onClick={()=>applyLoan(2500)}>Loan KES 2500</button>

<button onClick={()=>setPage("dashboard")}>Back</button>

</div>

)

}

/* DASHBOARD */

return(

<div style={styles.container}>

<div style={styles.header}>

<h2>Lock Savings</h2>

<button onClick={logout}>Logout</button>

</div>

<div style={styles.balanceCard}>

<FaWallet size={28} color="#fff"/>

<div>

<p style={{color:"#eee"}}>Wallet Balance</p>

<h2 style={{color:"#fff"}}>
{hideBalance ? "*****" : `KES ${profile?.wallet_balance ?? 0}`}
</h2>

</div>

<button onClick={()=>setHideBalance(!hideBalance)} style={styles.eyeBtn}>
{hideBalance ? <FaEye/> : <FaEyeSlash/>}
</button>

</div>

<div style={styles.grid}>

<button style={styles.iconCard} onClick={()=>setPage("deposit")}>
<FaArrowDown size={28} color="green"/>
<p>Deposit</p>
</button>

<button style={styles.iconCard} onClick={()=>setPage("withdraw")}>
<FaArrowUp size={28} color="red"/>
<p>Withdraw</p>
</button>

<button style={styles.iconCard} onClick={()=>setPage("savings")}>
<FaPiggyBank size={28} color="gold"/>
<p>Savings</p>
</button>

<button style={styles.iconCard} onClick={()=>setPage("loans")}>
<FaHandHoldingUsd size={28} color="purple"/>
<p>Loans</p>
</button>

</div>

<h3>Transactions</h3>

<table style={styles.table}>

<thead>

<tr>
<th>Type</th>
<th>Amount</th>
<th>Status</th>
</tr>

</thead>

<tbody>

{transactions.map(t=>(
<tr key={t.id}>
<td>{t.type}</td>
<td>KES {t.amount}</td>
<td>{t.status}</td>
</tr>
))}

</tbody>

</table>

</div>

)

}

const styles={

container:{padding:20,fontFamily:"Arial",background:"#f4f6f9",minHeight:"100vh"},

center:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"},

card:{background:"#fff",padding:20,borderRadius:10},

input:{width:"100%",padding:10,marginBottom:10},

primary:{width:"100%",padding:12,background:"#1e88e5",color:"#fff",border:"none"},

secondary:{width:"100%",padding:12},

header:{display:"flex",justifyContent:"space-between",marginBottom:20},

balanceCard:{background:"#1e88e5",padding:20,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"},

eyeBtn:{background:"transparent",border:"none",color:"#fff"},

grid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:15,marginTop:20},

iconCard:{background:"#fff",padding:20,borderRadius:10,border:"none",display:"flex",flexDirection:"column",alignItems:"center"},

table:{width:"100%",borderCollapse:"collapse"}

}
