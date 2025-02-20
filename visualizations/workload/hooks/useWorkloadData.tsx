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
  const intervalRef = useRef(null);

  const transformData = (response, entityGuid) => {
    setData((prevData) => {
      const newData = new Map(prevData);
      const newDates = new Set(dates);

      response.data.forEach((dataElement) => {
        newDates.add(dataElement.metadata.name);

        let valueMap = newData.get(entityGuid) || new Map();
        valueMap.set(dataElement.metadata.name, dataElement.data[0].y);
        newData.set(entityGuid, valueMap);
      });

      setDates(Array.from(newDates));
      return newData;
    });
  };

  const retrieveData = async () => {
    if (!accountIdList || !query) return;

    try {
      for (const accountIdListElement of accountIdList) {
        const entityGuid = accountIdListElement.entityGuid;
        const newQuery = query; // `${query} WHERE entity.guid = '${entityGuid}'`;

        const response = await NrqlQuery.query({
          query: newQuery,
          accountIds: [accountIdListElement.accountId],
        });

        if (response) {
          transformData(response, entityGuid);
          setResponse(response);
        }
      }
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

  return { data, dates, isLoading, response };
};
