import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react'
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import DiagnoseRenderer from '../component/DiagnoseRenderer'
import ProvisionRenderer from '../component/ProvisionRenderer'
import MigrateRenderer from '../component/MigrateRenderer'
import IssueRenderer from '../component/IssueRenderer'
import MyLinkRenderer from '../component/MyLinkRenderer'
import TagRenderer from '../component/TagRenderer'
import LabelRenderer from '../component/LabelRenderer'
import MaintenanceRenderer from '../component/MaintenanceRenderer'
import CostomHeader from '../component/CostomHeader'

class MyTable extends Component {
    constructor(props) {
        super(props);
        // console.log(props)
        var rowresize;
        if(this.props.rowResize!=null && this.props.rowResize === true){
            rowresize = true;
        }else{
            rowresize = false
        }
        this.state = {
            dataseted: false,
          columnDefs: props.columnDefs,
          rowData: props.rowData,
          rowResize: rowresize,
          rowSelection: 'multiple',
          rowGroupPanelShow: 'always',
          pagination: props.pagination,
          onClickSelectedName: props.onClickSelectedName,
          onClickSelectedName2: props.onClickSelectedName2,
          onClickSelectedName3: props.onClickSelectedName3,
          keepbottom: false,
          keepfilter: true,
          keepsort: true,
          keepselected: true,
          filtermodel: null,
          sortmodel: null,
          frameworkComponents:{
            diagnoseRenderer:DiagnoseRenderer,
            provisionRenderer:ProvisionRenderer,
            migrateRenderer:MigrateRenderer,
            issueRenderer:IssueRenderer,
            myLinkRenderer:MyLinkRenderer,
            tagRenderer:TagRenderer,
            labelRenderer:LabelRenderer,
            costomHeader:CostomHeader,
            maintenanceRenderer:MaintenanceRenderer
          },
          selectedNodes: null,
        };
        this.onClickSelected = this.onClickSelected.bind(this);
        this.onClickSelected2 = this.onClickSelected2.bind(this);
        this.onClickSelected3 = this.onClickSelected3.bind(this);
    }

    onGridReady = params => {
        this.gridApi = params.api;
        // console.log("onGridReady",this.gridApi)
        this.gridColumnApi = params.columnApi;
        if(this.props.sortitems != null){
            // console.log(this.props.sortitems)
            this.setState({sortmodel:this.props.sortitems})
            params.api.setSortModel(this.props.sortitems)
        }
        this.gridApi.onFilterChanged();
        params.columnApi.setColumnWidth("ip",180);
        if(this.props.onreadycallback != null){
            this.props.onreadycallback();
        }
        
    }

    componentWillReceiveProps(nextProps){
        // console.log("new props",this.props.rowData,nextProps.rowData);
        if(this.props.rowData !== nextProps.rowData || this.dataseted == false){
            if(this.props.stedy !== true){
                // console.log("Reset RowData")
                // console.log(this.gridApi)
                if(this.gridApi != null){
                    // console.log("Reset RowData")
                    this.setState({dataseted:true, rowData:nextProps.rowData, selectedNodes:this.gridApi.getSelectedNodes()})
                }
            }
        }
        if(this.props.defaultfilter !== null){
            // console.log("defaultfilter", this.props.defaultfilter)
            this.setState({filtermodel:this.props.defaultfilter})
        }
      }
    
    handleFilterChanged = params => {
        // console.log(params.api.getFilterModel())
        this.setState({filtermodel:params.api.getFilterModel()})
    }

    handleSortChanged = param => {
        this.setState({sortmodel:param.api.getSortModel()})
    }

    onColumnResized = params => {
        params.api.resetRowHeights();
      };

    handleRowDataChanged = params => {
        // console.log("changed")
        if(this.state.keepbottom === true){
            const index = this.state.rowData.length - 1;
            params.api.ensureIndexVisible(index, 'bottom')
        }
        if(this.state.filtermodel != null && this.state.keepfilter){
            // console.log("reapply filter")
            params.api.setFilterModel(this.state.filtermodel)
        }
        if(this.state.sortmodel != null && this.state.keepsort){
            // console.log("reapply sort")
            params.api.setSortModel(this.state.sortmodel)
        }
        if(this.state.selectedNodes != null && this.state.keepselected){
            // console.log(this.state.selectedNodes)
            let mycomp = this
            params.api.forEachNode(function(node){
                const selected = mycomp.state.selectedNodes.some((oldnode) => {return oldnode.id == node.id})
                node.setSelected(selected)
            })
        }
        params.api.onFilterChanged();
    }

    handleSelectionChanged = params => {
        params.api.onFilterChanged();
    }

    onClickSelected(){
        // console.log(this.gridApi)
        this.props.onClickSelected(this.gridApi.getSelectedRows())
    }

    onClickSelected2(){
        var data = this.gridApi.getSelectedRows()
        // this.setState({migrateData:data})
        this.props.onClickSelected2(data)
    }

    onClickSelected3(){
        var data = this.gridApi.getSelectedRows()
        // this.setState({migrateData:data})
        this.props.onClickSelected3(data)
    }

    componentDidMount(){
        if(this.props.keepbottom != null){
            this.setState({keepbottom:true})
        }
    }

    doesExternalFilterPass = node => {
        // console.log("filter external")
        var keys = Object.keys(this.props.filter_set)
        // console.log(keys)
        var i=0;
        for(i=0; i<keys.length; i++){
            // console.log(keys[i])
            if(this.props.filter_set[keys[i]].status){
                if(!this.props.filter_set[keys[i]].call_back(node)){
                    return false
                }
            }
        }
        return true;
      };

    isExternalFilterPresent = () => {
        return this.props.ifexternalfilter
    }

    render() {
        
        var ColDef;
        if(this.state.rowResize){
            ColDef = {
                cellClass: 'cell-wrap-text',
                resizable: true,
                autoHeight: true,
                filter: true,
              }
        }else{
            ColDef = {
                resizable: true,
                autoHeight: false,
                filter: true,
              }
        }

        if(this.state.notflex === true){

        }else{
            ColDef['flex'] = 1
        }

        if(this.props.floatfilter !== null){
            ColDef.floatingFilter = this.props.floatfilter
        }

        var tablehight;
        if(this.props.header === undefined){
            tablehight="100%"
        }else{
            tablehight=this.props.tablehight
        }

        // console.log(this.props.ifexternalfilter === true ? true : false)
        var getid;
        if(this.props.setid){
            getid = this.props.getid
        }else{
            getid = null;
        }

        return (
                <div style={{ height: '100%',width: '100%'}}>
                    <div style={{textAlign:"left"}}>
                        {this.props.header}
                    </div>
                    <div
                    id="myGrid"
                    style={{
                        height: tablehight,
                        width: '100%',
                    }}
                    className="ag-theme-alpine"
                    >
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            defaultColDef={ColDef}
                            suppressRowClickSelection={true}
                            groupSelectsChildren={true}
                            rowSelection={this.state.rowSelection}
                            rowGroupPanelShow={this.state.rowGroupPanelShow}
                            enableRangeSelection={true}
                            pagination={this.state.pagination}
                            rowData={this.state.rowData}
                            isExternalFilterPresent={this.isExternalFilterPresent}
                            doesExternalFilterPass={this.doesExternalFilterPass}
                            animateRows={true}
                            onGridReady={this.onGridReady}
                            onColumnResized={this.onColumnResized.bind(this)}
                            onRowDataChanged={this.handleRowDataChanged.bind(this)}
                            onSelectionChanged={this.handleSelectionChanged.bind(this)}
                            onFilterChanged={this.handleFilterChanged.bind(this)}
                            onSortChanged={this.handleSortChanged.bind(this)}
                            tooltipShowDelay={0}
                            frameworkComponents={this.state.frameworkComponents}
                            getRowStyle={this.props.rowStyle}
                            enableCellTextSelection={true}
                            getRowNodeId={getid}
                        />
                    </div>
                </div>
        );
    }
}

export default MyTable;
