"use client";

import {
ShieldCheck,
Boxes,
ClipboardCheck,
BadgeCheck
} from "lucide-react";


const items=[

{
icon:<ShieldCheck size={40}/>,
title:"Keamanan Tingkat Tinggi",
desc:"Enkripsi AES-256 standar militer"
},

{
icon:<Boxes size={40}/>,
title:"Blockchain Terverifikasi",
desc:"Data immutable di blockchain"
},

{
icon:<ClipboardCheck size={40}/>,
title:"Audit Trail Lengkap",
desc:"Semua akses tercatat dan diaudit"
},

{
icon:<BadgeCheck size={40}/>,
title:"Kepatuhan Regulasi",
desc:"Memenuhi standar keamanan internasional"
}

]


export default function Trust(){


return (

<section className="
py-20
bg-white
">


<h2 className="
text-center
text-3xl
font-bold
text-slate-900
">

Terpercaya, Aman, Terverifikasi

</h2>



<div className="
max-w-6xl
mx-auto
mt-12
grid
md:grid-cols-4
gap-6
px-6
">


{items.map((item)=>(


<div
key={item.title}
className="
text-center
p-6
rounded-2xl
border
hover:shadow-xl
transition
"
>


<div className="
flex
justify-center
text-blue-600
">

{item.icon}

</div>


<h3 className="
mt-5
font-bold
">

{item.title}

</h3>


<p className="
mt-3
text-sm
text-gray-500
">

{item.desc}

</p>


</div>


))}


</div>


</section>

)

}
