package com.silzila.querybuilder.CalculatedField.DateFlow;

import java.util.List;
import java.util.Map;

import com.silzila.dto.CalculatedFieldDTO;
import com.silzila.dto.FlowDTO;
import com.silzila.exception.BadRequestException;
import com.silzila.payload.request.Field;
import com.silzila.payload.request.Flow;
import com.silzila.querybuilder.CalculatedField.helper.*;

public class MotherDuckDateFlow {

    private final static String vendor = "motherduck";

    private static Map<String,String> dateParts = Map.of("day","DAY","week","WEEK","month","MONTH","year","YEAR");

    private static Map<String,String> dateOperations = Map.of("currentDate", "CURRENT_DATE","currentTimestamp","NOW()","minDate","MIN","maxDate","MAX");

    public static FlowDTO motherduckDateFlow(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, String flowKey,Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException{
        
        return switch (flow.getFlow()) {
            case "stringToDate" -> 
                stringToDateConversion(flow, fields, flowStringMap, calculatedFieldMap);
            case "addDateInterval" -> {
                CalculatedFieldRequestPrecheck.addIntervalDateOperation(flow, fields, flowStringMap, calculatedFieldMap);
                yield addDateInterval(flow, fields, flowStringMap, calculatedFieldMap);
            }
            case "dateInterval" -> {
                CalculatedFieldRequestPrecheck.dateIntervalDateOperation(flow, fields, flowStringMap, calculatedFieldMap);
                yield calculateDateInterval(flow, fields, flowStringMap, calculatedFieldMap);
            }
            case "datePartName" -> {
                CalculatedFieldRequestPrecheck.datePartNameDateOperation(flow, fields, flowStringMap, calculatedFieldMap);
                yield getDatePartName(flow, fields, flowStringMap, calculatedFieldMap);
            }
            case "datePartNumber" -> {
                CalculatedFieldRequestPrecheck.datePartNumberDateOperation(flow, fields, flowStringMap, calculatedFieldMap);
                yield getDatePartNumber(flow, fields, flowStringMap, calculatedFieldMap);
            }
            case "truncateDate" -> {
                CalculatedFieldRequestPrecheck.dateTruncateDateOperation(flow, fields, flowStringMap, calculatedFieldMap);
                yield getTruncateDateToPart(flow, fields, flowStringMap, calculatedFieldMap);
            }
            case "currentDate", "currentTimestamp" -> 
                getCurrentDateOrTimeStamp(flow, fields, flowStringMap, calculatedFieldMap);
            default -> 
                getMinOrMaxOfColumn(flow, fields, flowStringMap, calculatedFieldMap);
        };

    }
    
    // to process string to date conversion
    //1st source -> string, 2nd source -> date format
    private static FlowDTO stringToDateConversion(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException {
        
        List<String> source = flow.getSource();

        String dateFormat = DateFormatConverter.stringToDateFormat(vendor, source.subList(1, source.size()));

        flow.setSource(flow.getSource().subList(0, 1));

        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
                calculatedFieldMap);

        StringBuilder result = new StringBuilder();
        result.append("STRPTIME(").append(processedSource.get(0)).append(", '").append(dateFormat).append("')");

        return new FlowDTO(result.toString(), "date");
    }
    

    // add a interval to a date
    //1st source -> field or date, 2nd source -> number of date part , 3rd source -> date part(year,month,week,day) 
    private static FlowDTO addDateInterval(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException {
        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
                calculatedFieldMap);
        StringBuilder result = new StringBuilder();
        result.append(processedSource.get(0)).append("::DATE + INTERVAL ").append("'").append(flow.getSource().get(1)).append(" ").append(flow.getSource().get(2).toUpperCase()).append("'");

        String finalResult = result.toString();
        if (flow.getSourceType().get(0).equals("date") || (flow.getSourceType().get(0).equals("field"))
                && fields.get(flow.getSource().get(0)).getDataType().equals(Field.DataType.fromValue("date"))) {
            finalResult = CalculatedFieldProcessedSource.castingToDate(vendor, result.toString());
        }
        return new FlowDTO(finalResult.toString(), "date");
    }
    

    // difference between two dates
    //1st source -> field or date, 2nd source -> field or date , 3rd source -> result count in date part(year,month,week,day)
    private static FlowDTO calculateDateInterval(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException {

        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
        calculatedFieldMap);
    
        String result = """
                            CASE 
                                WHEN 'day' = '%?' THEN ( %!::DATE - %&::DATE ) 
                                WHEN 'week' = '%?' THEN ( (%!::DATE - %&::DATE) / 7 )
                                WHEN 'month' = '%?' THEN (EXTRACT(MONTH FROM %!::DATE) - EXTRACT(MONTH FROM %&::DATE)) + 
                                    (EXTRACT(YEAR FROM %!::DATE) - EXTRACT(YEAR FROM %&::DATE)) * 12
                                WHEN 'year' = '%?' THEN EXTRACT(YEAR FROM %!::DATE) - EXTRACT(YEAR FROM %&::DATE)
                            END
                """;
    
        result = result.replace("%!", processedSource.get(1))
                       .replace("%&", processedSource.get(0))
                       .replace("%?", flow.getSource().get(2));
            
       String aggregatedResult = !flow.getIsAggregation() ? result.toString() : aggregate(result.toString(), flow.getAggregation().get(0));

        return new FlowDTO(aggregatedResult, "integer");
    }
    
    //to get the name of the date part 
    //1st source -> field or date, 2nd source -> date part(month,day) 
    private static FlowDTO getDatePartName(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException {
    
        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
                calculatedFieldMap);
    
        StringBuilder result = new StringBuilder();
    
        String datePart = flow.getSource().get(1);
        String format = datePart.equals("month") ? "%B" : "%A"; // Full month name or full day name
    
        result.append("strftime('").append(format).append("', ").append(processedSource.get(0)).append("::DATE)");
    
        return new FlowDTO(result.toString(), "text");
    }
    
    

    //to get the number of the date part 
    //1st source -> field or date, 2nd source -> date part(year,month,day) 
    private static FlowDTO getDatePartNumber(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException {

        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
                calculatedFieldMap);
    
        StringBuilder result = new StringBuilder();
    
        String datePart = flow.getSource().get(1);
    
        result.append("EXTRACT(").append(dateParts.get(datePart)).append(" FROM ").append(processedSource.get(0)).append("::DATE)");

        String aggregatedResult = !flow.getIsAggregation() ? result.toString() : aggregate(result.toString(), flow.getAggregation().get(0));

        return new FlowDTO(aggregatedResult, "integer");
    }
    

    //to truncate a date to a desired date part
    //1st source -> field or date, 2nd source -> date part(year,month,week) 
    private static FlowDTO getTruncateDateToPart(Flow flow, Map<String, Field> fields, Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException {
    
        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
                calculatedFieldMap);
    
        StringBuilder result = new StringBuilder();
    
        String datePart = flow.getSource().get(1);
        
        result.append("DATE_TRUNC('").append(dateParts.get(datePart)).append("', ").append(processedSource.get(0)).append("::DATE)");
    
        String finalResult = result.toString();
        
        if (flow.getSourceType().get(0).equals("date") || (flow.getSourceType().get(0).equals("field"))
                && fields.get(flow.getSource().get(0)).getDataType().equals(Field.DataType.fromValue("date"))) {
            finalResult = CalculatedFieldProcessedSource.castingToDate(vendor, result.toString());
        }
        return new FlowDTO(finalResult.toString(), "date");
    }
    

    //to get a current date or timestamp
    private static FlowDTO getCurrentDateOrTimeStamp(Flow flow,Map<String, Field> fields,Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap){

        String dataType = flow.getFlow().equals("currentDate")?"date":"timestamp";

        return new FlowDTO(dateOperations.get(flow.getFlow()),dataType);

    }

    //to get a min or max 
    private static FlowDTO getMinOrMaxOfColumn(Flow flow,Map<String, Field> fields,Map<String, FlowDTO> flowStringMap, Map<String,CalculatedFieldDTO> calculatedFieldMap) throws BadRequestException{

        List<String> processedSource = CalculatedFieldProcessedSource.processDateSources(vendor,flow, fields, flowStringMap,
                calculatedFieldMap);

        return new FlowDTO(dateOperations.get(flow.getFlow()) + "(" + processedSource.get(0) + ")","date");  
        
    }

    private static String aggregate(String flow, String aggregationType) {
        return aggregationType.toUpperCase() + "(" + flow + ")";
    }

}
