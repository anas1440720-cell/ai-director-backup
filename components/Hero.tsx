"use client";

import { useState } from "react";
import AIDirector from "./AIDirector";

export default function Hero() {

  const [idea, setIdea] = useState("");
  const [started, setStarted] = useState(false);
console.log("Hero Render", { started, idea });

  const handleStart = () => {

    if (idea.trim() === "") {
      alert("Please describe your video idea first.");
      return;
    }

    setStarted(true);

  };


  return (

    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6">


      {/* Background Glow */}

      <div className="absolute left-1/2 top-40 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />



      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">



        <h1 className="text-6xl font-extrabold tracking-tight text-white">

          Direct your next masterpiece

        </h1>



        <p className="mt-6 text-xl text-gray-400">

          Every great film starts with one idea.

        </p>




        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">



          <textarea

            value={idea}

            onChange={(e)=>setIdea(e.target.value)}

            placeholder="Describe your movie idea..."

            className="
            h-48
            w-full
            resize-none
            bg-transparent
            text-lg
            text-white
            outline-none
            placeholder:text-gray-500
            "

          />




          <div className="mt-6 flex justify-end">


            <button

              onClick={handleStart}

              className="
              rounded-2xl
              bg-gradient-to-r
              from-blue-500
              to-cyan-400
              px-8
              py-4
              font-semibold
              text-white
              transition
              hover:scale-105
              "

            >

              ✨ Start Directing

            </button>



          </div>


        </div>





        {started && (

          <AIDirector idea={idea} />

        )}




      </div>


    </main>

  );

}