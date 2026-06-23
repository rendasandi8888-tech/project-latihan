"use client";

import { ShieldCheck, Cloud, BadgeCheck } from "lucide-react";


export default function Features(){


const data=[

{
icon:<ShieldCheck size={55}/>,
title:"Enkripsi Blockchain",
text:"Data medis dienkripsi menggunakan teknologi blockchain yang tidak dapat diubah."
},

{
icon:<Cloud size={55}/>,
title:"IPFS Storage",
text:"Data tersimpan terdesentralisasi untuk keamanan maksimal."
},

{
icon:<BadgeCheck size={55}/>,
title:"Verifikasi Publik",
text:"Verifikasi keaslian hasil scan secara aman dan transparan."
}

]


return (

<section
id="fitur"
className="
py-24
bg-white
">


<div className="
text-center
max-w-3xl
mx-auto
">


<h2 className="
text-3xl
font-bold
text-slate-900
">

Keamanan Data Medis Generasi Baru

</h2>


<p className="
mt-4
text-gray-500
">

Teknologi blockchain untuk melindungi dan mengelola data medis Anda.

</p>


</div>



<div className="
grid
md:grid-cols-3
gap-8
max-w-6xl
mx-auto
mt-14
px-6
">


{data.map((item)=>(


<div
key={item.title}
className="
bg-white
rounded-2xl
p-8
shadow-xl
border
hover:-translate-y-2
transition
"
>


<div className="
text-blue-600
">

{item.icon}

</div>


<h3 className="
mt-6
font-bold
text-xl
">

{item.title}

</h3>


<p className="
mt-3
text-gray-500
">

{item.text}

</p>


</div>


))}


</div>


</section>

)

}
