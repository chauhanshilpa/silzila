package com.silzila.querybuilder.filteroptions;

import java.util.List;
import java.util.Objects;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.silzila.dto.DatasetDTO;
import com.silzila.exception.BadRequestException;
import com.silzila.helper.ColumnListFromClause;
import com.silzila.payload.request.CalculatedFieldRequest;
import com.silzila.payload.request.ColumnFilter;
import com.silzila.payload.request.FilterPanel;
import com.silzila.payload.request.Table;
import com.silzila.querybuilder.RelationshipClauseGeneric;
import com.silzila.querybuilder.WhereClause;
import com.silzila.querybuilder.CalculatedField.CalculatedFieldQueryComposer;

import org.springframework.stereotype.Service;

@Service
public class FilterOptionsQueryComposer {

    private static final Logger logger = LogManager.getLogger(FilterOptionsQueryComposer.class);

    /*
     * Builds query for the dropped column into a filter
     * Query result are the unique values of the selected column.
     */
    public String composeQuery(ColumnFilter cf, DatasetDTO ds, String vendorName) throws BadRequestException {
        logger.info("----------- FilterOptionsQueryComposer calling......");
        String finalQuery = "";
        // if dataset is null calling getFilterOptions functions with null value for ds

        /*
         * builds SELECT Clause of SQL
         * SELECT clause is the most varying of all clauses, different for each dialect
         * select_dim_list columns are used in group_by_dim_list & order_by_dim_list
         * except that
         * select_dim_list has column alias and group_by_dim_list & order_by_dim_list
         * don't have alias
         */
        Table table = null;
        if (ds != null) {
            for (int i = 0; i < ds.getDataSchema().getTables().size(); i++) {
                if (ds.getDataSchema().getTables().get(i).getId().equals(cf.getTableId())) {
                    table = ds.getDataSchema().getTables().get(i);
                    break;
                }
            }
            if (Objects.isNull(table)) {
                throw new BadRequestException("Error: RequestedFiter Column is not available in Dataset!");
            }

            List<FilterPanel> datasetFilterPanels = ds.getDataSchema().getFilterPanels();

            List<List<CalculatedFieldRequest>> calcualtedFieldRequests = null;

            if (cf.getIsCalculatedField()) {
                String selectField = CalculatedFieldQueryComposer.calculatedFieldComposed(vendorName,
                        ds.getDataSchema(), cf.getCalculatedField());
                calcualtedFieldRequests = List.of(cf.getCalculatedField());
                cf.setFieldName(selectField);

            }
            if (!datasetFilterPanels.isEmpty()) {
                String datasetFilterWhereClause = WhereClause.buildWhereClause(datasetFilterPanels, vendorName,
                        ds.getDataSchema());
                cf.setWhereClause(datasetFilterWhereClause);
            }
            List<String> allColumnList = ColumnListFromClause.getColumnListFromCalculatedFieldAndFilterPanels(
                    calcualtedFieldRequests, ds.getDataSchema().getFilterPanels(), cf.getTableId());

            String fromClause = ((!allColumnList.isEmpty() && allColumnList.size() != 0))
                    ? RelationshipClauseGeneric.buildRelationship(allColumnList, ds.getDataSchema(), vendorName)
                    : "";

            cf.setFromClause(fromClause);

        }

        if (vendorName.equals("postgresql") || vendorName.equals("redshift")) {
            logger.info("------ inside postges/redshift block");
            finalQuery = FilterQueryPostgres.getFilterOptions(cf, table);
        } else if (vendorName.equals("mysql")) {
            logger.info("------ inside mysql block");
            finalQuery = FilterQueryMysql.getFilterOptions(cf, table);
        } else if (vendorName.equals("sqlserver")) {
            logger.info("------ inside sql server block");
            finalQuery = FilterQuerySqlserver.getFilterOptions(cf, table);
        } else if (vendorName.equals("databricks")) {
            logger.info("------ inside databricks block");
            finalQuery = FilterQueryDatabricks.getFilterOptions(cf, table);
        } else if (vendorName.equals("duckdb")) {
            logger.info("------ inside databricks block");
            finalQuery = FilterQueryDuckDb.getFilterOptions(cf, table);
        } else if (vendorName.equals("bigquery")) {
            logger.info("------ inside bigquery block");
            finalQuery = FilterQueryBigquery.getFilterOptions(cf, table);
        } else if (vendorName.equals("oracle")) {
            logger.info("------ inside Oracle block");
            finalQuery = FilterQueryOracle.getFilterOptions(cf, table);
        } else if (vendorName.equals("snowflake")) {
            logger.info("------ inside snowflake block");
            finalQuery = FilterQuerySnowflake.getFilterOptions(cf, table);
        } else if (vendorName.equals("motherduck")) {
            logger.info("------ inside motherduck/duckdb block");
            finalQuery = FilterQueryMotherduck.getFilterOptions(cf, table);
        } else if (vendorName.equals("db2")) {
            logger.info("------ inside DB2 block");
            finalQuery = FilterQueryDB2.getFilterOptions(cf, table);
        } else if (vendorName.equals("teradata")) {
            logger.info("------ inside teradata block");
            finalQuery = FilterQueryTeraData.getFilterOptions(cf, table);
        } else {
            throw new BadRequestException("Error: DB vendor Name is wrong!");
        }
        return finalQuery;
    }

}