import { useState, useEffect } from "react";
import { NrqlQuery } from "nr1";

export const useWorkloadData = (accountIdList, query) => {
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState(undefined);
  const [data, setData] = useState(new Map());
  const [dates, setDates] = useState([]);

  const transformData = (response, entityGuid) => {
    setData(() => {
      const newData = new Map();
      const newDates = new Set();

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

    setIsLoading(true);
    setData(new Map());
    setDates([]);

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
  }, [accountIdList, query]);

  return { data, dates, isLoading, response };
};
