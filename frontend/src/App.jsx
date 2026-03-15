import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import PaystackPop from "@paystack/inline-js"

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

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [pin,setPin] = useState("")
const [phone,setPhone] = useState("")

const [hideBalance,setHideBalance] = useState(false)

const [transactions,setTransactions] = useState([])
const [savings,setSavings] = useState([])

const [goalName,setGoalName] = useState("")
const [targetAmount,setTargetAmount] = useState("")

/* ================= LOGIN ================= */

const login = async()=>{

const {data,error} =
await supabase.auth.signInWithPassword({

email,
password

})

if(error){

alert(error.message)
return

}

setUser(data.user)

}

/* ================= SIGNUP ================= */

const signup = async()=>{

const {data,error} =
await supabase.auth.signUp({

email,
password

})

if(error){

alert(error.message)
return

}

await supabase.from("profiles").insert({

id:data.user.id,
email:email,
phone:phone,
pin:pin,
wallet_balance:0

})

alert("Account created")

}

/* ================= LOGOUT ================= */

const logout = async()=>{

await supabase.auth.signOut()

setUser(null)

}

/* ================= LOAD PROFILE ================= */

useEffect(()=>{

if(!user) return

loadProfile()
loadTransactions()
loadSavings()

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

/* ================= TRANSACTIONS ================= */

const loadTransactions = async()=>{

const {data} =
await supabase

.from("transactions")

.select("*")

.eq("user_id",user.id)

.order("created_at",{ascending:false})

setTransactions(data)

}

/* ================= SAVINGS ================= */

const loadSavings = async()=>{

const {data} =
await supabase

.from("savings")

.select("*")

.eq("user_id",user.id)

setSavings(data)

}

const createGoal = async()=>{

await supabase.from("savings").insert({

user_id:user.id,
goal_name:goalName,
target_amount:targetAmount

})

alert("Goal created")

loadSavings()

}

/* ================= PAYSTACK DEPOSIT ================= */

const deposit = (amount)=>{

const paystack = new PaystackPop()

paystack.newTransaction({

key:import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

email:profile.email,

amount:amount * 100,

currency:"KES",

onSuccess:(transaction)=>{

saveTransaction(amount,"deposit",transaction.reference)

},

onCancel:()=>{

alert("Payment cancelled")

}

})

}

const saveTransaction = async(amount,type,reference)=>{

await supabase.from("transactions").insert({

user_id:user.id,
type:type,
amount:amount,
status:"success",
reference:reference

})

await supabase.rpc("update_wallet",{

uid:user.id,
amt:amount

})

loadProfile()
loadTransactions()

}

/* ================= LOANS ================= */

const applyLoan = async(amount)=>{

if(profile.wallet_balance < amount/2){

alert("Save more to unlock loan")

return

}

await supabase.from("loans").insert({

user_id:user.id,
amount:amount,
status:"pending"

})

alert("Loan request sent")

}

/* ================= LOGIN PAGE ================= */

if(!user){

return(

<div style={styles.center}>

<div style={styles.card}>

<h2>Lock Savings</h2>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={styles.input}
/>

<input
placeholder="Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
style={styles.input}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={styles.input}
/>

<input
type="password"
placeholder="PIN"
value={pin}
onChange={(e)=>setPin(e.target.value)}
style={styles.input}
/>

<button onClick={login} style={styles.primary}>
Login
</button>

<button onClick={signup} style={styles.secondary}>
Create Account
</button>

</div>

</div>

)

}

/* ================= ADMIN ================= */

if(profile?.email === "admin@locksavings.com"){

return(

<div style={styles.container}>

<h2>Admin Dashboard</h2>

{transactions.map(t=>(

<div key={t.id}>

{t.type} - KES {t.amount}

</div>

))}

</div>

)

}

/* ================= DASHBOARD ================= */

return(

<div style={styles.container}>

<div style={styles.header}>

<h2>Lock Savings</h2>

<button onClick={logout} style={styles.logout}>
Logout
</button>

</div>


{/* BALANCE */}

<div style={styles.balanceCard}>

<FaWallet size={28} color="#fff"/>

<div>

<p style={{color:"#ddd"}}>Wallet Balance</p>

<h2 style={{color:"#fff"}}>

{hideBalance
? "******"
: `KES ${profile?.wallet_balance ?? 0}`}

</h2>

</div>

<button
onClick={()=>setHideBalance(!hideBalance)}
style={styles.eyeBtn}
>

{hideBalance ? <FaEye/> : <FaEyeSlash/>}

</button>

</div>


{/* ICONS */}

<div style={styles.grid}>

<button style={styles.iconCard} onClick={()=>deposit(100)}>
<FaArrowDown size={28} color="#2ecc71"/>
<p>Deposit</p>
</button>

<button style={styles.iconCard}>
<FaArrowUp size={28} color="#e74c3c"/>
<p>Withdraw</p>
</button>

<button style={styles.iconCard}>
<FaPiggyBank size={28} color="#f1c40f"/>
<p>Savings</p>
</button>

<button style={styles.iconCard}>
<FaHandHoldingUsd size={28} color="#9b59b6"/>
<p>Loans</p>
</button>

</div>


{/* SAVINGS */}

<div style={styles.card}>

<h3>Create Savings Goal</h3>

<input
placeholder="Goal name"
value={goalName}
onChange={(e)=>setGoalName(e.target.value)}
style={styles.input}
/>

<input
placeholder="Target amount"
value={targetAmount}
onChange={(e)=>setTargetAmount(e.target.value)}
style={styles.input}
/>

<button onClick={createGoal}>
Create Goal
</button>

{savings.map(goal=>(

<div key={goal.id} style={styles.goalCard}>

<h4>{goal.goal_name}</h4>

<p>
KES {goal.saved_amount ?? 0} / {goal.target_amount}
</p>

<div style={styles.progressBar}>

<div
style={{
width:
((goal.saved_amount ?? 0) /
goal.target_amount)*100+"%",
background:"#2ecc71",
height:"10px"
}}
></div>

</div>

</div>

))}

</div>


{/* TRANSACTIONS */}

<div style={styles.card}>

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

</div>

)

}

/* ================= STYLES ================= */

const styles={

container:{padding:20,fontFamily:"Arial",background:"#f4f6f9",minHeight:"100vh"},

center:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"},

card:{background:"#fff",padding:20,borderRadius:10,marginBottom:20},

input:{width:"100%",padding:10,marginBottom:10},

primary:{width:"100%",padding:12,background:"#1e88e5",color:"#fff",border:"none"},

secondary:{width:"100%",padding:12},

header:{display:"flex",justifyContent:"space-between",marginBottom:20},

logout:{background:"red",color:"#fff",border:"none",padding:8},

balanceCard:{background:"#1e88e5",padding:20,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"},

eyeBtn:{background:"transparent",border:"none",color:"#fff"},

grid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:15,marginTop:20},

iconCard:{background:"#fff",padding:20,borderRadius:10,border:"none",display:"flex",flexDirection:"column",alignItems:"center"},

progressBar:{width:"100%",background:"#eee",borderRadius:10,overflow:"hidden"},

goalCard:{marginTop:15},

table:{width:"100%",borderCollapse:"collapse"}

}
