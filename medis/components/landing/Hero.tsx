"use client";

import { motion } from "framer-motion";


export default function Hero(){

return (

<section
className="
relative
min-h-screen
flex
items-center
bg-cover
bg-center
"
style={{
backgroundImage:"url('/hero-medical.jpg')"
}}
>


<div className="
absolute inset-0
bg-gradient-to-r
from-blue-900/70
via-blue-700/40
to-white/20
"/>


<div className="
relative
z-10
max-w-7xl
mx-auto
px-8
pt-20
w-full
">


<motion.div

initial={{
opacity:0,
x:-50
}}

animate={{
opacity:1,
x:0
}}

transition={{
duration:.8
}}

className="
max-w-3xl
"

>


<h1 className="
text-white
font-bold
text-5xl
md:text-6xl
leading-tight
">

Sistem Manajemen
<br/>

Data Medis Terenkripsi
<br/>

dengan Blockchain

</h1>


<p className="
mt-6
text-white/90
text-lg
max-w-xl
">

Keamanan maksimal untuk hasil CT Scan & MRI Anda menggunakan teknologi blockchain.

</p>



<div className="
mt-10
flex
gap-5
">


<button
className="
bg-blue-500
hover:bg-blue-600
text-white
px-8
py-4
rounded-xl
font-semibold
shadow-lg
"
>

Verifikasi Hasil Scan

</button>



<button

className="
border
border-white
text-white
px-8
py-4
rounded-xl
font-semibold
"

>

Login Staff/Dokter

</button>


</div>


</motion.div>


</div>


</section>

)

}
