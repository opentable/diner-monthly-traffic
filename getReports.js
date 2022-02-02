/*
Code originally from here:
https://www.psand.net/blog/google-sheets-ga-api-v4.html
*/



function pasteData() {
  var valuesToPaste = getData();

  var pasteDateColumn = dateColumn.toUpperCase().charCodeAt(0) - 64; // What column should we put dates in. Variable is in variables.gs. 
  
  var trafficSS = SpreadsheetApp.openById(trafficSsId); // trafficSsId is defined in the variables.gs file.
  var metricsSheet = findSheet(trafficSS, metricsSheetId); // metricsSheetId is defined in the variables.gs file.

  metricsSheet.insertRows(dataRow, valuesToPaste.length);

  metricsSheet.getRange(dataRow, pasteDateColumn, valuesToPaste.length, valuesToPaste[0].length).setValues(valuesToPaste);

  //This part is very specific to this spreadsheet. You can use it as a model for copying and pasting formulas, but it won't make sense if you just add it to another spreadsheet.
  metricsSheet.getRange(dataRow + valuesToPaste.length, 5, 1, 6)
              .copyTo(metricsSheet.getRange(dataRow, 5, valuesToPaste.length, 6), SpreadsheetApp.CopyPasteType.PASTE_FORMULA,false);

  metricsSheet.getRange(dataRow + valuesToPaste.length, 15, 1, 17)
              .copyTo(metricsSheet.getRange(dataRow, 15, valuesToPaste.length, 17), SpreadsheetApp.CopyPasteType.PASTE_FORMULA,false);
}

function getData(){
  /* 
  
  Create GA Reporting v4 request JSON object. 

  Assumptions:
  -Spreadsheet has not changed (see trafficSsId in variables.gs)
  -Sheet key has not changed (see metricsSheetId in variables.gs, and findSheet function)
  -

  Miscellaneous:
  -If you are syncing this with a local copy, clasp (https://developers.google.com/apps-script/guides/clasp) will rename the .gs extension to .js. Don't try to make them match.
  */
  var dataToPaste = [];
  
  thisDateColumn = dateColumn.toUpperCase().charCodeAt(0) - 65; // What column should we put dates in. Variable is in variables.gs. 

  var rowTemplate = []; // Each row is an array. Declare an empty array, then reuse it as we loop through the report results.

/*
*** Here is where you can update the report that you want. It should be pretty straightforward, but ask me if you have any questions.

*/
for (i in metrics) {

  var thisMetric = metrics[i].metricName; // In the variables.gs file.
  var startDate = getStartDate(); // In the variables.gs file. You can hard code it if you want.
  var endDate = getEndDate(); // In the variables.gs file. You can hard code it if you want.

  var thisMetricColumn = metrics[i].metricColumn.toUpperCase().charCodeAt(0) - 65; // Convert the column names in variable.gs to column numbers (but starting from zero because they'll be arrays of arrays when we paste them in.)

  if (thisMetricColumn > rowTemplate.length) { // For each report, expand our row template to maximum width.
    for (k =0; k <= thisMetricColumn; k++) {
      rowTemplate[k] = '';
    }
  }

  var request = {
    "reportRequests":
    [
      {
        "viewId": viewId, // viewId is defined in the variables.gs file.
        "dateRanges": [
          {
          "startDate": startDate,
          "endDate": endDate
          }
        ],
        "includeEmptyRows": true,
        "metrics": [
          {"expression": thisMetric}
        ],
        "dimensions":[
          {"name":"ga:date"}
          ]
      }
    ]
  }

var results = AnalyticsReporting.Reports.batchGet(JSON.stringify(request));

  /* Documentation on making requests:
   https://developers.google.com/analytics/devguides/reporting/core/v4/basics
   https://ga-dev-tools.appspot.com/dimensions-metrics-explorer/

   This code originally pulled the metric names and put them in the top row. You can still get that from the JSON if you need it.
  */

  
  var thisReport = results.reports[0];
  
  var thisReportMetric = thisReport.columnHeader.metricHeader.metricHeaderEntries[0].name; // Assumes that there is only one metric per report. You can't pull 28-day and 1-day users in one report, so I loop.
  
  for (j in thisReport.data.rows)
  {
    var thisDataRow = thisReport.data.rows[j];
    
    var thisRowDateString = thisDataRow.dimensions[0];
    var year = thisRowDateString.substring(0,4);
    var month = thisRowDateString.substring(4,6);
    var day = thisRowDateString.substring(6,8);

    var thisRowDate = new Date(year, month-1, day);

    var thisRowMetric = thisDataRow.metrics[0].values[0];
  
    rowTemplate[dateColumn] = thisRowDate;
    rowTemplate[thisMetricColumn] = thisRowMetric;
    
    if (typeof(dataToPaste[j]) == 'undefined') {
      dataToPaste.push([]);
      for (var l = 0; l <= thisMetricColumn; l++) {
        switch (l) {
          case thisDateColumn:
            dataToPaste[j].push(thisRowDate);
            break;
            
          case thisMetricColumn:
            dataToPaste[j].push(thisRowMetric);
            break;

          default:
            dataToPaste[j].push('');
            break;
          }
        }
      } else {
        for (var l = 0; l <= thisMetricColumn; l++) {
          switch (typeof(dataToPaste[j][l])) {

            case 'undefined':
              if(l == thisMetricColumn) {
                dataToPaste[j].push(thisRowMetric);
              } else {
                dataToPaste[j].push('');
              }
              break;

            default:
              break;
          }
        }
      }
    }
  }
  return dataToPaste.sort(function(a, b) {
    return b[thisDateColumn] - a[thisDateColumn];
});;
} 

function findSheet(spreadsheet, key) { // There doesn't appear to be a way to select a sheet by ID, so we loop.
  var sheets = spreadsheet.getSheets();
  for (i in sheets) {
    var thisSheet = sheets[i];
    if (thisSheet.getSheetId() == key) return thisSheet;
  }
}