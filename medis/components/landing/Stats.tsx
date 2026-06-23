"use client";

import {motion} from "framer-motion";


export default function Stats(){


const data=[

["10K+","Data Medis Diamankan"],

["99.9%","Integrity Check"],

["24/7","Monitoring Sistem"],

["100%","Blockchain Verified"]

]


return (

<section className="
py-20
bg-blue-50
">


<div className="
max-w-6xl
mx-auto
grid
md:grid-cols-4
gap-6
px-6
">


{data.map((item,index)=>(


<motion.div

key={item[1]}

initial={{
opacity:0,
y:30
}}

whileInView={{
opacity:1,
y:0
}}

transition={{
delay:index*.1
}}

className="
bg-white
rounded-2xl
p-8
text-center
shadow
"


>


<h3 className="
text-4xl
font-bold
text-blue-600
">

{item[0]}

</h3>


<p className="
mt-3
text-gray-500
">

{item[1]}

</p>


</motion.div>


))}


</div>


</section>

)

}
