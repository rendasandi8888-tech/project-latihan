"use client";

import Link from "next/link";
import { ShieldPlus } from "lucide-react";


export default function Navbar(){


return (

<nav className="
fixed
top-0
w-full
z-50
bg-white/10
backdrop-blur-xl
border-b
border-white/20
">


<div className="
max-w-7xl
mx-auto
px-6
py-5
flex
justify-between
items-center
">


<div className="flex items-center gap-3">


<div className="
bg-blue-600
w-11
h-11
rounded-xl
flex
items-center
justify-center
text-white
">

<ShieldPlus size={28}/>

</div>


<span className="
text-white
font-bold
text-xl
">

MedChain

</span>


</div>



<div className="
hidden
md:flex
gap-8
text-white
">


<Link href="/">
Beranda
</Link>

<Link href="#fitur">
Fitur
</Link>

<Link href="#workflow">
Cara Kerja
</Link>

<Link href="/verify">
Verifikasi
</Link>


</div>



<Link
href="/admin"
className="
px-6
py-3
rounded-full
border
border-white
text-white
hover:bg-white
hover:text-blue-700
transition
"
>

Login Staff/Dokter

</Link>


</div>


</nav>

)

}
