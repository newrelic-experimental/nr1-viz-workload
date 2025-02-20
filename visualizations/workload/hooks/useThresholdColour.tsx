import { useMemo } from "react";

const useThresholdColour = (
  warningThreshold: string,
  criticalThreshold: string
) => {
  const sanitize = (value: string) => {
    const filteredValue = String(value).replace(/[^0-9.]/g, ""); // Allow only numbers and dots
    return filteredValue.replace(/(\..*)\./g, "$1"); // Prevent multiple dots
  };

  const filteredWarningThreshold = parseFloat(sanitize(warningThreshold));
  const filteredCriticalThreshold = parseFloat(sanitize(criticalThreshold));

  const getThresholdColour = useMemo(() => {
    return (value: string | number): string => {
      const numericValue = parseFloat(value as string);

      if (!isNaN(numericValue)) {
        if (numericValue < filteredCriticalThreshold) {
          return "red"; // Critical breach
        } else if (numericValue < filteredWarningThreshold) {
          return "orange"; // Warning breach
        }
      }
      return ""; // No breach
    };
  }, [filteredWarningThreshold, filteredCriticalThreshold]);

  return { getThresholdColour };
};

export { useThresholdColour };
