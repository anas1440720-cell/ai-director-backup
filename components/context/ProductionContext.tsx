"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type ProductionContextType = {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
};

const ProductionContext =
  createContext<ProductionContextType | null>(null);

export function ProductionProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [scenes, setScenes] = useState<Scene[]>([]);

  return (

    <ProductionContext.Provider
      value={{
        scenes,
        setScenes,
      }}
    >

      {children}

    </ProductionContext.Provider>

  );

}

export function useProduction() {

  const context = useContext(ProductionContext);

  if (!context) {

    throw new Error(
      "useProduction must be used inside ProductionProvider"
    );

  }

  return context;

}