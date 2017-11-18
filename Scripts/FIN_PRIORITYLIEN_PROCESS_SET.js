/*------------------------------------------------------------------------------------------------------/
| Finance Oakland Payment - Transfer to County Set 
|
| 11/20/2012 - KG
| 1/13/2013 - KG - Updated to create set only.
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
var setPrefix = getParam("setPrefix");							//   Prefix for set ID
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

if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess()
	{
	var capFilterType = 0
	var capFilterInactive = 0;
	var capFilterError = 0;
	var capFilterStatus = 0;
	var capDeactivated = 0;
	var capCount = 0;
	var setName;
	var setDescription;

	var ctResult = aa.cap.getByAppType(appGroup, appTypeType); //Get Array of Lien Records
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

			var capStatus = cap.getCapStatus();
			if (exists(capStatus,skipAppStatusArray)) {
				capFilterStatus++;
				logDebug(capIDshow + ": skipping due to application status of " + capStatus)
				continue;
			}	capCount++;

		// Create Set
		if (setPrefix != "" && capCount == 1)
			{
			var yy = startDate.getFullYear().toString().substr(2,2);
			var mm = (startDate.getMonth()+1).toString();
			if (mm.length<2)
				mm = "0"+mm;
			var dd = startDate.getDate().toString();
			if (dd.length<2)
				dd = "0"+dd;
			var hh = startDate.getHours().toString();
			if (hh.length<2)
				hh = "0"+hh;
			var mi = startDate.getMinutes().toString();
			if (mi.length<2)
				mi = "0"+mi;

			var setName = setPrefix.substr(0,5) + yy + mm + dd + hh + mi;

			setDescription = setPrefix + " : " + startDate.toLocaleString()
			var setCreateResult= aa.set.createSet(setName,setDescription)

			if (setCreateResult.getSuccess())
				logDebug("Set ID "+setName+" created for CAPs processed by this batch job.");
			else
				logDebug("ERROR: Unable to create new Set ID "+setName+" created for CAPs processed by this batch job.");

			}

		// Actions start here:
		
		// Add to Set

		if (setPrefix != "") aa.set.add(setName,capId)
		
	} // end for loop
 	logDebug("Total CAPS qualified date range: " + capTypeList.length);
 	logDebug("Ignored due to application type: " + capFilterType);
 	logDebug("Ignored due to CAP Status: " + capFilterStatus);
 	logDebug("Ignored due to Deactivated CAP: " + capDeactivated);
 	logDebug("Total CAPS processed: " + capCount);
} // end function body