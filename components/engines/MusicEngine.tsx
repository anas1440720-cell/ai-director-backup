"use client";

type MusicEngineProps = {
  style: string;
  goal: string;
};


export default function MusicEngine({
  style,
  goal,
}: MusicEngineProps) {


  const getMusic = () => {


    if(style === "Fantasy"){
      return {
        genre:"Epic fantasy orchestral music",
        emotion:"Adventure and mystery",
        instruments:"Orchestra, drums, magical sounds"
      };
    }


    if(style === "Pixar"){
      return {
        genre:"Emotional animated soundtrack",
        emotion:"Warm and inspiring",
        instruments:"Piano, strings and soft orchestra"
      };
    }


    if(style === "Anime"){
      return {
        genre:"Anime cinematic soundtrack",
        emotion:"Powerful emotional moments",
        instruments:"Rock, orchestra and dramatic drums"
      };
    }


    if(style === "Realistic"){
      return {
        genre:"Hollywood cinematic score",
        emotion:"Deep cinematic atmosphere",
        instruments:"Full orchestra and cinematic effects"
      };
    }


    return {
      genre:"Cinematic background music",
      emotion:"Emotional storytelling",
      instruments:"Modern cinematic instruments"
    };

  };


  const music = getMusic();



  return (

    <div className="
    mt-8
    rounded-3xl
    border border-purple-500/30
    bg-purple-500/10
    p-6
    ">


      <h3 className="text-xl font-bold text-white">
        🎵 Music Engine
      </h3>


      <div className="mt-4 space-y-3 text-gray-300">


        <p>
          🎼 Genre:
          <span className="text-white">
          {" "}{music.genre}
          </span>
        </p>


        <p>
          ❤️ Emotion:
          <span className="text-white">
          {" "}{music.emotion}
          </span>
        </p>


        <p>
          🎹 Instruments:
          <span className="text-white">
          {" "}{music.instruments}
          </span>
        </p>


      </div>


      <p className="mt-5 text-gray-400">
        🎯 Purpose: {goal}
      </p>


    </div>

  );

}