/*------------------------------------------------------------------------------------------------------/
| Oakland Planning Appeal Period Over CD Batch
|
| 06/20/2013 - KG
| 06/28/2013 - PTN: Corrected status ' Not Creekside-Pending Appeal' in filter, took out leading space
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
/------------------------------------------------------------------------------------------------------*/

emailText = "";
var showDebug = false;				// Set to true to see debug messages in email confirmation
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM"));


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");

batchJobID = 0;
if (batchJobResult.getSuccess()) {
	batchJobID = batchJobResult.getOutput();
  	logMessage("START","Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
  	logMessage("WARNING","Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
| BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var emailAddress = getParam("emailAddress");						// email to send batch job log
var appGroup = getParam("appGroup");							//   app Group to process {Licenses}
var appTypeType = getParam("appTypeType");						//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");						//   app subtype to process {NA}
var appCategory = getParam("appCategory");						//   app category to process {NA}
var skipAppStatusArray = getParam("skipAppStatus").split(",")				// Skips the Application statuses of this type
var showDebugParam = getParam("showDebug");

/*----------------------------------------------------------------------------------------------------/
| SETUP
/------------------------------------------------------------------------------------------------------*/
if (showDebugParam.equals("Y")) showDebug = true;
var startDate = new Date();
var timeExpired = false;


var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var AInfo = new Array();

if (appGroup=="")
	appGroup="*";
if (appTypeType=="")
	appTypeType="*";
if (appSubtype=="")
	appSubtype="*";
if (appCategory=="")
	appCategory="*";
var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
| 
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess()
	{
	var capFilterType = 0
	var capFilterInactive = 0;
	var capFilterError = 0;
	var capFilterStatus = 0;
	var capWorkflowUpdated = 0;
	var capCount = 0;

	var ctResult = aa.cap.getByAppType(appGroup, appTypeType,appSubtype,appCategory); //Get Array of Records
	var capTypeList;
	if (ctResult.getSuccess()) 
     		capTypeList = ctResult.getOutput();
	else {
		logDebug("Error getting cap type list " + ctResult.getErrorMessage());
	}

	for (thisCap in capTypeList) {  
			if (elapsed() > maxSeconds) { // only continue if time hasn't expired
				logMessage("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
				timeExpired = true ;
				break; 
			}

			cap = capTypeList[thisCap];
			capId = cap.getCapID();
			capIDshow = capId.getCustomID();

			logDebug("Record ID is: " + capIDshow);
			
			appTypeResult = cap.getCapType();		//create CapTypeModel object
			appTypeString = appTypeResult.toString();	
			appTypeArray = appTypeString.split("/");	

			/* All Record Types are the same per the retrieval logic
			// Filter by CAP Type
			if (appType.length && !appMatch(appType)) 
			{
			capFilterType++;
			//logDebug("Skipping CAP " + capIDshow + ": app type doesn't match")
			continue;
			}
			*/

			// Filter by CAP Status
			var capStatus = cap.getCapStatus();
			
			if(!matches(capStatus,"Creekside-Pending Appeal","Not Creekside-Pending Appeal"))
			{
				capFilterStatus++;
				logDebug(capIDshow + ": skipping due to application status of " + capStatus)
				continue;
			}	
			
			capCount++;

			// Get Application Specific Information - Appeal Date
			loadAppSpecific(AInfo);
			var todayJS = new Date();
			var appealEndDate = getAppSpecific("Appeal Period End Date");
			if(appealEndDate != "undefined" && appealEndDate != null && appealEndDate != "")
			{
				logDebug("Appeal Period End Date is: " + appealEndDate);
			
				var appealEndDateJS = new Date(appealEndDate);

				//--------------------------------
				// ACTIONS START HERE
				//--------------------------------
			
				// Update Workflow Tasks
				if (todayJS > appealEndDateJS)
				{
					logDebug("Today's date is greater than the Appeal Period End Date.");
				
					if(capStatus == "Creekside-Pending Appeal")
					{
						updateTask("Closure","Creekside","Updated by Batch Script","");
						logDebug("Workflow Task Closure was updated to Creekside on Record " + capIDshow);
						capWorkflowUpdated++;
					}
					
					if(capStatus == "Not Creekside-Pending Appeal")
					{
						updateTask("Closure","Not Creekside","Updated by Batch Script","");
						logDebug("Workflow Task Closure was updated to Not Creekside on Record " + capIDshow);
						capWorkflowUpdated++;
					}
							
				}
								
			}
			else
			{
				logDebug("The Appeal Period End Date ASI field has no value.");
			}
		
	} // end for loop
 	
	logDebug("Total CAPS qualified date range: " + capTypeList.length);
 	logDebug("Ignored due to application type: " + capFilterType);
 	logDebug("Ignored due to CAP Status: " + capFilterStatus);
 	logDebug("Workflow Updated: " + capWorkflowUpdated);
 	logDebug("Total CAPS processed: " + capCount);
	if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);
	
	function logDebug(pText)
	{
		aa.print("DEBUG: " + pText);
	}
	
} // end function body