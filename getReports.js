/*
Code originally from here:
https://www.psand.net/blog/google-sheets-ga-api-v4.html
*/

function fetchApiV4Data(){

  /* 
  
  Create GA Reporting v4 request JSON object. 

  Assumptions:
  -Spreadsheet has not changed (see trafficSsId)
  -Sheet key has not changed (see metricsSheetId below, and findSheet function)
  -Date column is in the same place (see dateColumn below)

  */

  var trafficSS = SpreadsheetApp.openById(trafficSsId); // trafficSsId is defined in the variables.gs file.
  var metricsSheet = findSheet(trafficSS, metricsSheetId); // metricsSheetId is defined in the variables.gs file.

  var metricsSheetLastRow = metricsSheet.getLastRow();
  var dateColumn = 1;

  var dateValues = metricsSheet.getRange(1, dateColumn, metricsSheetLastRow).getValues();

/*
*** Here is where you can update the report that you want.

*/

  var request = {
    "reportRequests":
    [
      {
        "viewId": viewId, // viewId is defined in the variables.gs file.
        "dateRanges": [
          {
          "startDate": '2021-12-01',
          "endDate": '2022-01-01'
          }
        ],
        "includeEmptyRows": true,
        "metrics": [
          {"expression": "ga:28dayUsers"}
        ],
        "dimensions":[
         // {"name":"ga:month"},
          {"name":"ga:date"}
          ]
      }
    ]
  }

  var results = AnalyticsReporting.Reports.batchGet(JSON.stringify(request));

  // Documentation on making requests:
  // https://developers.google.com/analytics/devguides/reporting/core/v4/basics
  // https://ga-dev-tools.appspot.com/dimensions-metrics-explorer/


  // Write the results to the "Data" sheet 
  var spreadSheet = SpreadsheetApp.openById('1-oAbKM-k0qMv0vBnbJVPRJSYd_5Yp6mAU0GimvWGAVg');
  var sheet = spreadSheet.getSheetByName('Sheet6');
  sheet.clear();
  
  // Write column headers to row 1
  var headerNames = [];
  
  // Push each dimension title on to the header row
  var dimensionHeaders = results.reports[0].columnHeader.dimensions;
  for (var i=0; i<dimensionHeaders.length; i++){
    headerNames.push(dimensionHeaders[i]);
  } 
  // Push each metric title on to the header row
  var metricHeaders = results.reports[0].columnHeader.metricHeader.metricHeaderEntries;
  for  (var i=0; i<metricHeaders.length; i++){
    headerNames.push(metricHeaders[i].name);
  }
  // Output header row to the sheet
  sheet.getRange(1, 1, 1, headerNames.length)
    .setValues([headerNames]);

 
  // Write result data rows starting at row 2
  var rows = [];

  // Cycle through the results object rows creating a 2 dimensional array
  for (y=0; y<results.reports[0].data.rows.length; y++){
      rows[y] = [];

      // Push each dimension on to the row
        for (var i=0; i<results.reports[0].data.rows[y].dimensions.length; i++){ 
        rows[y].push(results.reports[0].data.rows[y].dimensions[i]);
      }
      // Push each metric on to row
      for (var i=0; i<results.reports[0].data.rows[y].metrics[0].values.length; i++){
        rows[y].push(results.reports[0].data.rows[y].metrics[0].values[i]);
      }
  }
  // Output data rows to the sheet  
  sheet.getRange(2, 1, rows.length, headerNames.length)
    .setValues(rows);

}

function findSheet(spreadsheet, key) {
  var sheets = spreadsheet.getSheets();
  for (i in sheets) {
    var thisSheet = sheets[i];
    if (thisSheet.getSheetId() == key) return thisSheet;
  }
}