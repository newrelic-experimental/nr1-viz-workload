import React from 'react';
import PropTypes from 'prop-types';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import { Table,TableHeader,TableHeaderCell,TableRow,TableRowCell } from 'nr1'

import {Card, CardBody, HeadingText, NrqlQuery, Spinner, AutoSizer} from 'nr1';

export default class WorkloadVisualization extends React.Component {
    // Custom props you wish to be configurable in the UI must also be defined in
    // the nr1.json file for the visualization. See docs for more details.
    static propTypes = {
        /**
         * A fill color to override the default fill color. This is an example of
         * a custom chart configuration.
         */
        fill: PropTypes.string,

        /**
         * A stroke color to override the default stroke color. This is an example of
         * a custom chart configuration.
         */
        stroke: PropTypes.string,
        /**
         * An array of objects consisting of `accountId`.
         * This should be a standard prop for any NRQL based visualizations.
         */
        accountIdList: PropTypes.arrayOf(
            PropTypes.shape({
                accountId: PropTypes.number,
                entityGuid: PropTypes.string
            })
        ),
        query: PropTypes.string,

        loading: PropTypes.bool,

        response: PropTypes.object,

        data: PropTypes.map,

        dates: PropTypes.array,
    };

    constructor(props) {
        super(props);
        this.retrieveData = this.retrieveData.bind(this);
        this.transformData = this.transformData.bind(this);
        this.state = { loading: true, response: undefined, data: new Map, dates: [] ,query :'' };
      }

    componentDidMount() {
        this.retrieveData(this.props.accountIdList,this.props.query);
      }


    // shouldComponentUpdate(nextProps, nextState) {
    // console.log(nextProps.query);
    // console.log(this.props.query);
    // return this.props.query !=  nextProps.query;
    // }
      

    transformData(response,entityGuid){

        let transformedDataMap = this.state.data;
        let dates = this.state.dates;

        response.data.map((dataElement) => {
            console.log(dataElement);
            if(!dates.includes(dataElement.metadata.name)){
                dates.push(dataElement.metadata.name);
            }

            let valueMap;
            if(transformedDataMap.has(entityGuid)){
                 valueMap = transformedDataMap.get(entityGuid);
            }
            else{
                valueMap = new Map();
            }
            valueMap.set(dataElement.metadata.name,dataElement.data[0].y);
            transformedDataMap.set(entityGuid,valueMap);
        });
        console.log('transformedDataMap',transformedDataMap);
        this.setState({data: transformedDataMap, dates: dates});

    }

    ///- TO DO re render when query changes
    //Re rendering spree to be stopped


    async retrieveData(accountIdList,query){
       this.state.loading = true; 
       this.props.accountIdList.map((accountIdListElement) => {        
        let entityGuid = accountIdListElement.entityGuid;
        let newQuery = query+" WHERE entity.guid = '"+entityGuid+"'";
        const result= NrqlQuery.query({
                query : newQuery , 
                accountIds: [accountIdListElement.accountId] 
            }).then((response)=> { 
                console.log(newQuery);
                console.log(response);
                if(response){
                    this.transformData(response,entityGuid);
                }
                
                this.setState({loading: false,response: response});
            });     
        }); 
    }


    render() {
        const {loading,query,accountIdList, stroke, fill} = this.props;
        console.log('render',this.props.query);

        const nrqlQueryPropsAvailable =
        accountIdList && query &&
            accountIdList.map((accountIdListElement) => 
                accountIdListElement.accountId  && accountIdListElement.entityGuid);

        if (!nrqlQueryPropsAvailable) {
            return <EmptyState />;
        }
        
        if (loading || this.state.response === undefined) {
           return <Spinner />;
        }

        return (
          <div>
            <Table items={this.state.dates} multivalue fullWidth>
                <TableHeader>
                    <TableHeaderCell>Date</TableHeaderCell>
                    {
                    accountIdList.map((accountIdListElement) => {
                     return <TableHeaderCell>{accountIdListElement.entityGuid}</TableHeaderCell>
                    })
                    }       
                </TableHeader>
                {({ item }) => (
                    
                <TableRow>
                    <TableRowCell>{item}</TableRowCell>
                    {
                    accountIdList.map((accountIdListElement) => {
                        if(this.state.data.get(accountIdListElement.entityGuid) === undefined){
                            return <TableRowCell> - </TableRowCell>
                        }
                        else{
                            return <TableRowCell> {(this.state.data.get(accountIdListElement.entityGuid)).get(item)}</TableRowCell>
                        }
                    })}
                </TableRow> 
                )}

            </Table> 
            </div>
        );        

    }
}

const EmptyState = () => (
    <Card className="EmptyState">
        <CardBody className="EmptyState-cardBody">
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Please provide at least one NRQL query & account ID pair
            </HeadingText>
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
                type={HeadingText.TYPE.HEADING_4}
            >
                An example NRQL query you can try is:
            </HeadingText>
            <code>
                FROM NrUsage SELECT sum(usage) FACET metric SINCE 1 week ago
            </code>
        </CardBody>
    </Card>
);

const ErrorState = () => (
    <Card className="ErrorState">
        <CardBody className="ErrorState-cardBody">
            <HeadingText
                className="ErrorState-headingText"
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Oops! Something went wrong.
            </HeadingText>
        </CardBody>
    </Card>
);
