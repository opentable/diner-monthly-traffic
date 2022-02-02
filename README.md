# diner-monthly-traffic
Automate diner monthly traffic report in Sheets from Google Analytics (GA)

This specific script is written to automate the diner product team's monthly traffic data in Google Sheets, pulling from Google Analytics.

You can also use this as a template for other automations and calculations. Contact Finn Smith (fsmith) if you have any questions.

The .gitignore file hides:

* variables.gs - This file defines variables, such as the view ID in GA and the key of the spreadsheet to update. 
* appsscript.json - Holds the ID of the Google Apps Script project. 


You'll probably want to use clasp (https://developers.google.com/apps-script/guides/clasp) so that you can sync the online IDE with your local repo.
