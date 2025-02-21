import React, { createContext, useContext, ReactNode } from "react";

// This has to be updated to match the keys in your config - for ts to give you type hints
type ConfigKeys =
  | "accountIdList"
  | "query"
  | "warningThreshold"
  | "criticalThreshold";

type VizProps = {
  [key in ConfigKeys]: any;
};

const VizPropsContext = createContext<VizProps | null>(null);

interface VizPropsProviderProps {
  children: ReactNode;
  [key: string]: any; // Allow dynamic props
}

export const VizPropsProvider = ({
  children,
  ...props
}: VizPropsProviderProps) => {
  return (
    <VizPropsContext.Provider value={props}>
      {children}
    </VizPropsContext.Provider>
  );
};

export const useProps = () => {
  const context = useContext(VizPropsContext);
  if (!context) {
    throw new Error("useProps must be used within a VizPropsProvider");
  }
  return context;
};

export default VizPropsContext;
