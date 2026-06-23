export default function Verification(){

return (

<section className="
py-24
text-center
">


<h2 className="
text-3xl
font-bold
">

Verifikasi Keaslian Hasil Scan

</h2>


<p className="
mt-3
text-gray-500
">

Masukkan hash verification untuk memastikan integritas data.

</p>



<div className="
max-w-3xl
mx-auto
mt-10
flex
px-6
">


<input

placeholder="Masukkan Hash Verification"

className="
flex-1
border
p-4
rounded-l-xl
outline-none
"

/>


<button

className="
bg-blue-600
text-white
px-8
rounded-r-xl
"

>

Verify Now

</button>


</div>


</section>


)

}
