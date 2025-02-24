# SLI Workload vizualization

This vizualisation displays SLI data for the last X days for a given entity.

<img width="1500" alt="Image" src="https://github.com/user-attachments/assets/08e11f9c-6423-4bc6-878b-fed0edd490ab" />

#### Configuration

The configuration options are:

- NRQL query, please use the following query for SLI visualisation:
  ```sql
  FROM Metric
  SELECT
    (sum(newrelic.sli.valid) - sum(newrelic.sli.bad)) / sum(newrelic.sli.valid) * 100
  FACET dateOf(timestamp) SINCE 30 DAYS AGO LIMIT MAX
  ```
  - you can change the `since` clause to any time range you want to visualise SLI data for
  - for example for the last week you can use `SINCE 7 DAYS AGO`.
- Entity GUID, please use the entity GUID of the entity you want to visualise SLI data for.
- Entity Name - (optional) name for the column header you want to assign to the entity with a given GUID.

Thresholds:

- Warning threshold - the value at which the SLI is considered to be in a warning state.
- Critical threshold - the value at which the SLI is considered to be in a critical state.

You can use decimal values for the thresholds, for example, `99.95` for 99.95% uptime.

Thresholds highlight the SLI values when they are below the warning threshold or critical threshold.

#### Development

##### Running the nerdlet locally

Run the following scripts:

```
npm install
npm start
```

Visit https://one.newrelic.com/?nerdpacks=local and :sparkles:

##### Building and publishing the visualisation

Visit: [Publish your Nerdpack](https://docs.newrelic.com/docs/new-relic-solutions/new-relic-one/build-nr-apps/publish/)
