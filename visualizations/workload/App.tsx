import React from "react";
import PropTypes from "prop-types";

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  Spinner,
} from "nr1";

import { EmptyState } from "./components/EmptyState";
import { useWorkloadData } from "./hooks/useWorkloadData";

const App = ({ accountIdList, query, loading, stroke, fill }) => {
  const { data, dates, isLoading, response } = useWorkloadData(
    accountIdList,
    query
  );

  const nrqlQueryPropsAvailable =
    accountIdList &&
    query &&
    accountIdList.every(
      (accountIdListElement) =>
        accountIdListElement.accountId && accountIdListElement.entityGuid
    );

  if (!nrqlQueryPropsAvailable) {
    return <EmptyState />;
  }

  if (loading || isLoading || response === undefined) {
    return <Spinner />;
  }

  return (
    <div>
      <Table items={dates} multivalue fullWidth>
        <TableHeader>
          <TableHeaderCell>Date</TableHeaderCell>
          {accountIdList.map((accountIdListElement) => (
            <TableHeaderCell key={accountIdListElement.entityGuid}>
              {accountIdListElement.entityGuid}
            </TableHeaderCell>
          ))}
        </TableHeader>
        {({ item }) => (
          <TableRow>
            <TableRowCell>{item}</TableRowCell>
            {accountIdList.map((accountIdListElement) => {
              const entityData = data.get(accountIdListElement.entityGuid);
              return (
                <TableRowCell key={accountIdListElement.entityGuid}>
                  {entityData.get(item)}
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
