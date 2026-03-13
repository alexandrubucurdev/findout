import Image from "next/image";

export default function Home() {
     return (
          <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
               <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                    <div>
                         <h1>Carina, spor la treaba!</h1>
                         <br />
                         <h2>
                              Sterge campurile din className care nu-ti convin
                              si sterge ce am scris eu.
                         </h2>
                         <br />
                         <h3>Sterge si global css si i-o de la zero</h3>
                         <br />
                         <h1>Bagă!</h1>
                    </div>
               </main>
          </div>
     );
}
