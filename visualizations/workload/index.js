import React from "react";
import { VizPropsProvider } from "./context/VizPropsProvider";
import { App } from "./App";

const WorkloadVisualisation = (props) => {
  return (
    <div style={{ height: "100%" }}>
      <VizPropsProvider {...props}>
        <App {...props} />
      </VizPropsProvider>
    </div>
  );
};

export default WorkloadVisualisation;
