import React from "react";
import PropTypes from "prop-types";
import { navigation } from "nr1";

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  Spinner,
} from "nr1";

import { EmptyState } from "./components/EmptyState";
import { useProps } from "./context/VizPropsProvider";
import { useWorkloadData } from "./hooks/useWorkloadData";
import { useThresholdColour } from "./hooks/useThresholdColour";

const App = () => {
  const { accountIdList, query, loading, warningThreshold, criticalThreshold } =
    useProps();

  const { data, dates, isLoading, hasData } = useWorkloadData(
    accountIdList,
    query
  );

  const { getThresholdColour } = useThresholdColour(
    warningThreshold,
    criticalThreshold
  );

  const nrqlQueryPropsAvailable =
    accountIdList &&
    query &&
    accountIdList.every(
      (accountIdListElement) =>
        accountIdListElement.accountId && accountIdListElement.entityGuid
    );

  if (!nrqlQueryPropsAvailable) {
    return <EmptyState message="Invalid query parameters" />;
  }

  if (loading || isLoading) {
    return <Spinner />;
  }

  if (!hasData) {
    return <EmptyState message="No data available" />;
  }

  return (
    <div>
      <Table items={dates} multivalue fullWidth>
        <TableHeader>
          <TableHeaderCell>Date</TableHeaderCell>
          {accountIdList.map((accountIdListElement) => (
            <TableHeaderCell key={accountIdListElement.entityGuid}>
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  navigation.openEntity(accountIdListElement.entityGuid); // Open entity
                }}
                rel="noopener noreferrer"
              >
                {accountIdListElement.entityName ||
                  accountIdListElement.entityGuid}
              </a>
            </TableHeaderCell>
          ))}
        </TableHeader>
        {({ item }) => (
          <TableRow>
            <TableRowCell>{item}</TableRowCell>
            {accountIdList.map((accountIdListElement) => {
              const entityData = data.get(accountIdListElement.entityGuid);
              const value = entityData ? entityData.get(item) : null;
              const color = getThresholdColour(value);

              return (
                <TableRowCell
                  key={accountIdListElement.entityGuid}
                  style={
                    color
                      ? {
                          color: color,
                        }
                      : {}
                  }
                >
                  {!isNaN(Number(value)) && value !== null
                    ? Math.round(Number(value) * 1000) / 1000
                    : value ?? "—"}
                </TableRowCell>
              );
            })}
          </TableRow>
        )}
      </Table>
    </div>
  );
};

App.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
  accountIdList: PropTypes.arrayOf(
    PropTypes.shape({
      accountId: PropTypes.number,
      entityGuid: PropTypes.string,
    })
  ),
  query: PropTypes.string,
  loading: PropTypes.bool,
};

export { App };
