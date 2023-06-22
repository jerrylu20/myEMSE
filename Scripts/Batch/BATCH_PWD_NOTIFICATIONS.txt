/*-----------------------------------------------------------------------------------------------------
| Program: BATCH_PWD_NOTIFICATIONS.js  Trigger: Batch
| Description: This batch job script sends notifications to all contacts on records a certain number of days prior to the Expiration Date.
|              It also sends an email to designated staff of a list of the records that have these email sent.
| Created by: Guchun 
| Version 1.0 - Base Version. -- 5/20/2021
|
|              
|------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------
| START: USER CONFIGURABLE PARAMETERS
/-------------------------------------------------------------------------------------------------------*/
aa.env.setValue("BatchJobName", "BATCH_PWD_NOTIFICATIONS")
aa.env.setValue("appGroup", "Engineering")
aa.env.setValue("appTypeType", "*")
aa.env.setValue("appSubtype", "*")
aa.env.setValue("appCategory", "*")
aa.env.setValue("emailNotificationsYN", "Y")
aa.env.setValue("emailSender", "Do_Not_Reply@martin.fl.us")
aa.env.setValue("emailAddress", "Guchun Huang <ghuang@martin.fl.us>")

aa.env.setValue("skipAppStatus", "CLOS,Closed-Complete,Closed-Denied,Closed-Expired,Closed-Ineligible,Closed-Withdrawn,CNCL,DONE");

/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
}
else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH", null, false));
/*------------------------------------------------------------------------------------------------------/
|
| END: Includes
|
/------------------------------------------------------------------------------------------------------*/

//Global variables
var startTime = (new Date()).getTime();
br = "\n<br>";
showDebug = true;			// Set to true to see debug messages in email confirmation
showMessage = true;			// Set to true to see debug messages in email confirmation
currentUserID = aa.env.getValue("CurrentUserID");

var emailText = "";
var maxSeconds = 10 * 60;		// number of seconds allowed for batch processing
var timeExpired = false;
var sysDate = aa.date.getCurrentDate();
var currDate = new Date();
var batchJobID = 0;
var batchJobResult = aa.batchJob.getJobID()
var batchJobName = "" + aa.env.getValue("BatchJobName");
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var paramsOK = true;


if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*------------------------------------------------------------------------------------------------------/
| Start: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var appGroup = getParam("appGroup");					// app Group to process {Licenses}
var appTypeType = getParam("appTypeType");				// app type to process {Rental License}
var appSubtype = getParam("appSubtype");				// app subtype to process {NA}
var appCategory = getParam("appCategory");				// app category to process {NA}
var emailNotificationsYN = getParam("emailNotificationsYN");	// send out emails?
var emailSender = getParam("emailSender");				// email sender account
var emailAddress = getParam("emailAddress");				// email to notify the batch

var skipAppStatusArray = getParam("skipAppStatus").split(","); //   Skip records with one of these application statuses

/*------------------------------------------------------------------------------------------------------/
| End: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/

if (appGroup == "*") appGroup = null;
if (appTypeType == "*") appTypeType = null;
if (appSubtype == "*") appSubtype = null;
if (appCategory == "*") appCategory = null;
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;


/*------------------------------------------------------------------------------------------------------/
| Main Process
/------------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    logMessage("**********************************************************************");
    logMessage("           Job Start");
    logMessage("**********************************************************************");
    if (!timeExpired) {
        try {
            mainProcess();
        }
        catch (err) {
            logMessage("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
            logMessage("Stack: " + err.stack);
        }
    }
    logMessage("**********************************************************************");
    logMessage("           Job End: " + batchJobName + " Elapsed Time : " + elapsed() + " Seconds");
    logMessage("**********************************************************************");
    if (emailAddress.length) aa.sendMail(emailSender, emailAddress, "", batchJobName + " Results", emailText + " - End of Job: " + batchJobName + " Elapsed Time : " + elapsed() + " Seconds");
    aa.print(message);
    //aa.print(debug);
}
/*------------------------------------------------------------------------------------------------------/
| End Main Process
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Main Function
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {
    var myCaps = [];
    var thisCap;
    var dnow = aa.util.formatDate(aa.util.now(), "MM/dd/YYYY");
    var capDeactivated = 0;
    var capFilterStatus = 0;
    var capFilterNoDate = 0;
    var capFilterType = 0;
    var capFilterTask = 0;
    var capCount = 0;
    var capCount0 = 0;
    var capCount1 = 0;
    var capCount11 = 0;
    var capCount12 = 0;
    var capCount2 = 0;
    var capCount3 = 0;
    //var emailVal = "pwdpermits@martin.fl.us";
    var emailVal = "ghuang@martin.fl.us";
    var emailErrorAlert = lookup("Agency_Email", "ScriptErrorAlert");
    var msg = "";


    //Get the records
    var capResults = aa.cap.getByAppType(appGroup, appTypeType, appSubtype, appCategory);

    if (capResults.getSuccess()) {
        var msg_detail = "Batch job results for " + batchJobName +" run on " + dnow + br;
        myCaps = capResults.getOutput();

        //msg_detail = msg_detail + "App type is " + appType + br;
        msg_detail = msg_detail + "Total number of PWD records: " + myCaps.length + br;
        msg_detail = msg_detail + "Email sent to: " + emailVal + br;
        msg_detail = msg_detail + "------------------------------------------------------------" + br;
        // for each record
        for (thisCap in myCaps) {
            if (elapsed() > maxSeconds) {//only continue if time hasn't expired           
                logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
                timeExpired = true;
                break;
            }

            //Get the record information

            capId = myCaps[thisCap].getCapID();
            altId = capId.getCustomID();
            capIDString = capId.getCustomID();

            var capResult = aa.cap.getCap(capId);
            if (!capResult.getSuccess()) {
                //logDebug(altId + " skipped. Record is deactivated");
                capDeactivated++;
                continue;
            }

            var cap = capResult.getOutput();
            var capModel = cap.getCapModel();
            var capStatus = capModel.getCapStatus();
            var capStatusDate = capModel.getCapStatusDate();

            var capTypeAlias = cap.getCapType().getAlias();
            appTypeResult = cap.getCapType(); //create CapTypeModel object
            appTypeString = appTypeResult.toString();
            appTypeArray = appTypeString.split("/");  //This variable is needed for the appMatch in later section to work correctly.

            // Filter by CAP Type
            if (!(appMatch("Engineering/Right of way use permit/*/*")
                || appMatch("Engineering/RO Permit/*/*")
                || appMatch("Engineering/Excavation And Fill Permit/NA/NA"))) {
                capFilterType++;
                //logDebug(altId + " skipped due to application type of " + capTypeAlias);
                continue;
            }

            // Filter by CAP Status
            if (exists(capStatus, skipAppStatusArray)) {
                //logMessage("==" + altId + ": Skipped due to application status of " + capStatus);
                capFilterStatus++;
                continue;
            }

            // Filter by CAP Status Date
            var expDate = getScheduledDate();
            if (expDate == null || expDate == "") {
                //logMessage("==" + altId + ": Skipped because no expiration date is found.");
                capFilterNoDate++;
                continue;
            }

            var days1 = 30;
            var days2 = 60;
            var days3 = 90;
            var dCompare = daysBetween(dnow, expDate); // Days until expiration

            // msg_detail = msg_detail + altId + ", " + appTypeString + ", " + capStatus + " " + dCompare + " days ago on " + statusDateFormatted + br;
            // Skip those with incorrect expiration dates.
            if (dCompare != days1 && dCompare != days2 && dCompare != days3) {
                capCount0++;
                continue;
            }

            logDebug(altId + ": " + capTypeAlias + ", Status: " + capStatus + ", expDate: " + expDate + ", dCompare: " + dCompare);
            msg_detail += altId + ": " + capTypeAlias + ", Status: " + capStatus + ", expDate: " + expDate + ", dCompare: " + dCompare + br;

            var emailTo = getAllContactEmails();


            var params = aa.util.newHashtable();
            getRecordParams4NotificationMC(params);
            addParameter(params, "$$days$$", dCompare.toString());
            addParameter(params, "$$expDate$$", expDate);

            //logDebug(params);
            // logDebug("This is a friendly reminder that " + capTypeAlias + " permit "+ altId + " for " + capName +" at "+ capAddr+" will expire on " + expDate+".")

            capCount1++;

            if (emailTo.length > 0 && emailTo.toString().indexOf("@") > 0 && emailTo.toString().indexOf(".") > 2) {
                capCount11++;  // Number of records that emails are sent 
                sendNotification("Do_Not_Reply@martin.fl.us", emailTo, "", "PWD_BATCH_EXP", params, null);
            }
            else {
                capCount12++;  // Number of records that emails are NOT sent 
                msg_detail += "[" + capCount12 + "] " + altId + ", email not sent. No valid contact email is found on record." + br;
            }


            // Make sure the current status is not triggered directly on Application task. Another task should be marked complete and inactive on the record.



            /*                        */
        }

        msg = msg_detail + "------------------------------------------------------------" + br;
        if (capDeactivated > 0) {
            msg = msg + "Total Records skipped due to Status not being Active: " + capDeactivated + br;
        }
        msg = msg + "Total Records skipped due to wrong type: " + capFilterType + br;
        msg = msg + "Total Records skipped due to wrong status: " + capFilterStatus + br;
        msg = msg + "Total Records skipped due to having not Expiration Date: " + capFilterNoDate + br;
        msg = msg + "Total Records skipped due to Expiration Date not requiring notification: " + capCount0 + br;
        msg = msg + "--Total Records requiring notification: " + capCount1 + br;
        if (capCount1 > 0) {
            msg = msg + "----Email sent: " + capCount11 + br;
            msg = msg + "----Email NOT sent (due to no valid contact email on record): " + capCount12 + br;
        }
        msg = msg + "------------------------------------------------------------";
        logMessage(msg);
        aa.sendMail("Do_Not_Reply@martin.fl.us", emailVal, "ghuang@martin.fl.us", "Batch job results for " + batchJobName, msg);
    }
    else {
        logMessage("Error: The batch job can not retrieve the specified records.");
    }
}

/*------------------------------------------------------------------------------------------------------/
| 			External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
//Gets parameter value and logs message showing param value
function getParam(pParamName) {
    var ret = "" + aa.env.getValue(pParamName);
    logDebug("Parameter : " + pParamName + " = " + ret);
    return ret;


}

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)


}

//Gets the script contect
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        }
        else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    }
    catch (err) {
        return "";
    }


}

function logDebug(dstr) {
    aa.print(dstr)
    emailText += dstr + br;
    // disabled to cut down on event log entries.
    //aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
    //aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
    // ELPLogging.debug(dstr);
}


