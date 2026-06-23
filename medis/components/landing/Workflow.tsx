"use client";

import {
UploadCloud,
LockKeyhole,
Link,
ShieldCheck,
UserRound,
Search,
KeyRound,
FileCheck
} from "lucide-react";


const patient = [

{
icon:<UploadCloud/>,
title:"Upload Hasil Scan",
desc:"Pasien upload hasil CT Scan atau MRI ke sistem kami"
},

{
icon:<LockKeyhole/>,
title:"Enkripsi Blockchain",
desc:"Data dienkripsi dan hash disimpan di blockchain"
},

{
icon:<Link/>,
title:"Dapatkan Hash",
desc:"Pasien menerima hash verification untuk verifikasi publik"
},

{
icon:<ShieldCheck/>,
title:"Kelola Data Aman",
desc:"Data tersimpan aman dan hanya dapat diakses dengan izin"
}

];


const doctor=[

{
icon:<UserRound/>,
title:"Login ke Sistem",
desc:"Staff atau dokter login dengan kredensial resmi"
},

{
icon:<Search/>,
title:"Akses Data Terenkripsi",
desc:"Pilih data pasien dan akses data terenkripsi"
},

{
icon:<KeyRound/>,
title:"Dekripsi Data",
desc:"Sistem mendekripsi data untuk viewing yang aman"
},

{
icon:<FileCheck/>,
title:"Audit Trail",
desc:"Semua akses tercatat di blockchain untuk audit trail"
}

];


function Card({title,color,data}:any){


return (

<div className="
bg-white
rounded-2xl
border
shadow-sm
p-8
">


<h3 className={`
text-xl
font-bold
mb-8
${color}
border-b
pb-4
`}>

{title}

</h3>


<div className="space-y-8">


{data.map((item:any,index:number)=>(


<div
key={item.title}
className="flex gap-5"
>


<div className="
flex
flex-col
items-center
">


<div className="
w-10
h-10
rounded-full
bg-blue-600
text-white
flex
items-center
justify-center
">

{index+1}

</div>


{index !== 3 && (

<div className="
w-px
h-12
bg-gray-200
">

</div>

)}


</div>



<div>


<div className="
text-blue-600
mb-2
">

{item.icon}

</div>


<h4 className="
font-bold
">

{item.title}

</h4>


<p className="
text-sm
text-gray-500
mt-1
">

{item.desc}

</p>


</div>



</div>


))}


</div>


</div>


)

}



export default function Workflow(){


return (

<section
id="workflow"
className="
py-24
bg-slate-50
scroll-mt-24
">


<h2 className="
text-center
text-3xl
font-bold
text-slate-900
">

Cara Kerja

</h2>



<div className="
max-w-6xl
mx-auto
grid
md:grid-cols-2
gap-8
mt-12
px-6
">


<Card
title="Untuk Pasien"
color="text-blue-600"
data={patient}
/>



<Card
title="Untuk Staff/Dokter"
color="text-green-600"
data={doctor}
/>


</div>


</section>

)

}