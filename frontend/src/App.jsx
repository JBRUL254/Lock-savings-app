import { useEffect, useState } from "react"
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

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const [hideBalance,setHideBalance] = useState(false)

/* ================= SESSION ================= */

useEffect(()=>{

const getSession = async()=>{

const {data} = await supabase.auth.getSession()

setUser(data?.session?.user || null)

}

getSession()

const {data:listener} =
supabase.auth.onAuthStateChange((_event,session)=>{

setUser(session?.user || null)

})

return ()=>{

listener.subscription.unsubscribe()

}

},[])


/* ================= LOAD PROFILE ================= */

useEffect(()=>{

if(!user) return

const loadProfile = async()=>{

const {data} = await supabase
.from("profiles")
.select("*")
.eq("id",user.id)
.single()

setProfile(data)

}

loadProfile()

},[user])


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

const user = data.user

await supabase.from("profiles").insert({

id:user.id,
email:email,
wallet_balance:0

})

alert("Account created")

}


/* ================= LOGOUT ================= */

const logout = async()=>{

await supabase.auth.signOut()

setUser(null)

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
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={styles.input}
/>

<button
onClick={login}
style={styles.primary}
>

Login

</button>

<button
onClick={signup}
style={styles.secondary}
>

Create Account

</button>

</div>

</div>

)

}


/* ================= DASHBOARD ================= */

return(

<div style={styles.container}>

<div style={styles.header}>

<h2>Lock Savings</h2>

<button
onClick={logout}
style={styles.logout}
>

Logout

</button>

</div>


{/* BALANCE CARD */}

<div style={styles.balanceCard}>

<FaWallet size={28} color="#fff"/>

<div>

<p style={{color:"#ddd"}}>

Wallet Balance

</p>

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



{/* ICON GRID */}

<div style={styles.grid}>

<button style={styles.iconCard}>

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



{/* TRANSACTIONS */}

<div style={styles.card}>

<h3>Recent Transactions</h3>

<p>No transactions yet</p>

</div>

</div>

)

}


/* ================= STYLES ================= */

const styles = {

container:{
padding:20,
fontFamily:"Arial",
background:"#f4f6f9",
minHeight:"100vh"
},

center:{
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"#f4f6f9"
},

card:{
background:"#fff",
padding:25,
borderRadius:10,
width:350,
boxShadow:"0 10px 20px rgba(0,0,0,0.1)"
},

input:{
width:"100%",
padding:12,
marginBottom:10
},

primary:{
width:"100%",
padding:12,
background:"#1e88e5",
color:"#fff",
border:"none",
marginBottom:8,
borderRadius:6
},

secondary:{
width:"100%",
padding:12,
borderRadius:6
},

header:{
display:"flex",
justifyContent:"space-between",
marginBottom:20
},

logout:{
background:"#ff4d4d",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:6
},

balanceCard:{
background:"linear-gradient(135deg,#1e88e5,#42a5f5)",
borderRadius:12,
padding:20,
display:"flex",
alignItems:"center",
justifyContent:"space-between",
marginBottom:25,
boxShadow:"0 10px 20px rgba(0,0,0,0.15)"
},

eyeBtn:{
background:"transparent",
border:"none",
color:"#fff",
fontSize:18
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:15,
marginBottom:25
},

iconCard:{
background:"#fff",
borderRadius:12,
padding:20,
border:"none",
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",
gap:8,
boxShadow:"0 6px 15px rgba(0,0,0,0.1)",
cursor:"pointer",
fontWeight:"bold"
}

}

