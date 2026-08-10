"use client";

type CharacterEngineProps = {
  idea: string;
  character: string;
  style: string;
  goal?: string;
  audience?: string;
};


export default function CharacterEngine({
  idea,
  character,
  style,
  goal,
  audience,
}: CharacterEngineProps) {


  const generateCharacter = () => {


    if (character === "One Main Character") {

      return {

        name: "Adam",

        age:
          audience === "Kids"
            ? "10 years old child"
            : "Young adult",

        appearance:
          style === "3D"
            ? "3D cinematic hero character, expressive eyes, detailed face"
            : "Realistic cinematic character with detailed facial features",

        clothes:
          "Adventure clothing designed for cinematic storytelling",

        personality:
          goal === "Teach"
            ? "Curious, intelligent and loves discovering knowledge"
            : "Brave, emotional and ready for adventure",

        voice:
          "Professional cinematic character voice",

        consistency:
          "Same face, hairstyle, clothes and personality in every scene",

        prompt:
          `${style} cinematic main character, ${goal} story, consistent face, movie lighting`

      };

    }



    if (character === "Multiple Characters") {

      return {

        name: "Adventure Team",

        age: "Children and adults",

        appearance:
          "Group of unique cinematic characters with different personalities",

        clothes:
          "Adventure outfits with detailed cinematic design",

        personality:
          "Teamwork, courage, friendship and curiosity",

        voice:
          "Different voices for every character",

        consistency:
          "Maintain identical faces, clothes and personalities in every shot",

        prompt:
          `${style} cinematic adventure team, ${goal}, multiple consistent characters`

      };

    }



    if (character === "Animals") {

      return {

        name: "Leo",

        age: "Young animal",

        appearance:
          "Cinematic animal character with expressive emotions",

        clothes:
          "Natural appearance",

        personality:
          "Funny, loyal and brave",

        voice:
          "Emotional animated character voice",

        consistency:
          "Same animal design throughout the whole video",

        prompt:
          `${style} cinematic animal character, emotional story, consistent design`

      };

    }



    return {

      name: "Fantasy Hero",

      age: "Unknown",

      appearance:
        "Legendary fantasy creature with magical cinematic details",

      clothes:
        "Epic fantasy armor",

      personality:
        "Mysterious, powerful and heroic",

      voice:
        "Deep cinematic fantasy voice",

      consistency:
        "Same design, colors and abilities in every scene",

      prompt:
        `${style} fantasy cinematic hero, epic movie character`

    };


  };



  const characterData = generateCharacter();



  return (

    <div
      className="
      mt-8
      rounded-2xl
      border border-yellow-500/30
      bg-yellow-500/10
      p-6
      "
    >


      <h3 className="text-xl font-bold text-white">
        👤 Character Engine
      </h3>



      <div className="mt-4 space-y-3 text-gray-300">


        <p>
          🧑 Name:
          <span className="text-white">
            {" "}{characterData.name}
          </span>
        </p>


        <p>
          🎂 Age:
          <span className="text-white">
            {" "}{characterData.age}
          </span>
        </p>


        <p>
          👀 Appearance:
          <span className="text-white">
            {" "}{characterData.appearance}
          </span>
        </p>


        <p>
          👕 Clothes:
          <span className="text-white">
            {" "}{characterData.clothes}
          </span>
        </p>


        <p>
          🧠 Personality:
          <span className="text-white">
            {" "}{characterData.personality}
          </span>
        </p>


        <p>
          🎙 Voice:
          <span className="text-white">
            {" "}{characterData.voice}
          </span>
        </p>


        <p>
          🔒 Consistency:
          <span className="text-white">
            {" "}{characterData.consistency}
          </span>
        </p>


      </div>



      <div className="mt-5 rounded-xl border border-white/10 p-4">


        <p className="text-gray-400">
          🎯 AI Character Prompt
        </p>


        <p className="mt-2 text-white">
          {characterData.prompt}
        </p>


      </div>


    </div>

  );


}