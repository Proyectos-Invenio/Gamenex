'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from 'next/link';



function HomePage() {
  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="w-50 h-50 mb-8 relative group">
        <Image
          src="/Logo.svg"
          alt="Logo de Gamenex"
          width={80}
          height={80}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-purple-600 opacity-0  "></div>
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 tracking-tighter">
        GAMENEX
      </h1>
      <p className="text-lg md:text-xl text-center mb-10 max-w-md text-gray-400">
        Conecta. Juega. Domina.
      </p>
      <Link href="/sign-in"> {/* Ajusta '/ruta-destino' a la URL que desees */}
        <Button className="bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold py-3 px-8 text-lg transition-all duration-300 ease-in-out">
          UNIRSE
        </Button>
      </Link>
      <div className="mt-8 text-gray-500 text-sm">
        La red social para verdaderos gamers
      </div>
    </div>


  );
}
export default HomePage;
