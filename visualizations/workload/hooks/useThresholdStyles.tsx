import { useMemo } from "react";

const useThresholdStyles = (
  warningThreshold: string,
  criticalThreshold: string
) => {
  const sanitize = (value: string) => {
    const filteredValue = String(value).replace(/[^0-9.]/g, ""); // Allow only numbers and dots
    return filteredValue.replace(/(\..*)\./g, "$1"); // Prevent multiple dots
  };

  const filteredWarningThreshold = parseFloat(sanitize(warningThreshold));
  const filteredCriticalThreshold = parseFloat(sanitize(criticalThreshold));

  const getCellStyle = useMemo(() => {
    return (value: string | number) => {
      const numericValue = parseFloat(value as string);

      if (!isNaN(numericValue)) {
        if (numericValue < filteredCriticalThreshold) {
          return { backgroundColor: "red", color: "white" }; // Critical breach
        } else if (numericValue < filteredWarningThreshold) {
          return { backgroundColor: "orange", color: "black" }; // Warning breach
        }
      }
      return {};
    };
  }, [filteredWarningThreshold, filteredCriticalThreshold]);

  return { getCellStyle };
};

export { useThresholdStyles };
