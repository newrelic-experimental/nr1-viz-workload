import { useState, useEffect, useRef } from "react";
import { NrqlQuery } from "nr1";

export const useWorkloadData = (
  accountIdList,
  query,
  refreshInterval = 30000
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState(undefined);
  const [data, setData] = useState(new Map());
  const [dates, setDates] = useState([]);
  const [hasData, setHasData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transformData = (response, entityGuid) => {
    if (!response?.data?.length) {
      return;
    }

    setData((prevData) => {
      const newData = new Map(prevData);
      const newDates = new Set(dates);

      response.data.forEach((dataPoint) => {
        newDates.add(dataPoint.metadata.name);

        let valueMap = newData.get(entityGuid) || new Map();
        valueMap.set(dataPoint.metadata.name, dataPoint.data[0]?.y ?? null);
        newData.set(entityGuid, valueMap);
      });

      setDates(Array.from(newDates));
      setHasData(true);
      return newData;
    });
  };

  const retrieveData = async () => {
    if (!accountIdList || !query) return;

    let foundData = false;

    try {
      for (const accountIdListElement of accountIdList) {
        const entityGuid = accountIdListElement.entityGuid;
        const newQuery = `${query} WHERE entity.guid = '${entityGuid}'`;

        const response = await NrqlQuery.query({
          query: newQuery,
          accountIds: [accountIdListElement.accountId],
        });

        if (response?.data?.length) {
          transformData(response, entityGuid);
          foundData = true;
          setResponse(response);
        }
      }

      setHasData(foundData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    retrieveData();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      retrieveData();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [accountIdList, query, refreshInterval]);

  return { data, dates, isLoading, hasData };
};
