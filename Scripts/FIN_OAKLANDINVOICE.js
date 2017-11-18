/*------------------------------------------------------------------------------------------------------/
| Program: FIN_OaklandInvoiceV1.0.js  Trigger: Batch    
| Client: Oakland   Request # SR5059
| 
| Version 1.0 - Base Version. 3/1/13 KG
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;								// Set to true to see debug messages in email confirmation
var maxSeconds = 30 * 60;							// number of seconds allowed for batch processing, usually < 5*60
var reportURL = "https://reporting.accela.com/reportmanager/showreport.do"	// URL of billing report
var currentUserID = "ADMIN"

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("batchJobName");

batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logMessage("START","Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logMessage("WARNING","Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var appGroup = getParam("appGroup");				//   app Group to process {Licenses}
var appTypeType = getParam("appTypeType");			//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");			//   app subtype to process {NA}
var appCategory = getParam("appCategory");			//   app category to process {NA}
var setName = getParam("setName");				//   Prefix for set ID
var agingDate = getParam("agingDate");				// Aging Date
var emailAddress = getParam("emailAddress");			// email to send report
var emailReportSetID = getParam("emailReportSetID");		// email to send report
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
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


var sysDate = aa.date.getCurrentDate();

if (agingDate == "")
	{
	var agingDateObj = new Date()
	agingDate = agingDateObj.getMonth() + "/" + agingDateObj.getDayOfMonth() + "/" + agingDateObj.getYear()
	}
else
	var agingDateObj = new Date(agingDate)
	
if (setName != "") setName = setName + agingDate;
	

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
| 
/-----------------------------------------------------------------------------------------------------*/

logMessage("START","Start of Job");

if (!timeExpired) mainProcess();

logMessage("END","End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length && showDebug) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Debug Output", emailText);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function mainProcess()
	{
	var capFilterType = 0
	var capFilterWf = 0;
	var capCount = 0;
	var inspDate;
	
	var invoiceLevel2 = 0;

	// Create Set
		if (setName != "")
		{
		logDebug("Creating Set " + setName);
		aa.set.createSet(setName,setName)
		}	
		
	var invResult = aa.invoice.getUnpaidInvoices()
	
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	else
		{ logMessage("ERROR","ERROR: Getting unpaid invoices, reason is: " + invResult.getErrorType() + ":" + invResult.getErrorMessage()) ; return false }
	


	for (thisInv in invList)  // for each Invoice
		{
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
			{ 
			logMessage("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
			}

		// Get the CAP and populate data.  Assume one CAP per invoice
		
		var thisInvoice = invList[thisInv];
		
  		f = aa.invoice.getFeeItemInvoiceByInvoiceNbr(thisInvoice.getInvNbr()).getOutput()

		tempId = f[0].getCapID();
		capId = getCapId(tempId.getID1(),tempId.getID2(),tempId.getID3()); // call internal function
		var capIDshow = capId.getCustomID(); // this method works

		cap = aa.cap.getCap(capId).getOutput();		
		var capStatus = cap.getCapStatus();

		appTypeResult = cap.getCapType();		//create CapTypeModel object
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");	

		// Filter by CAP Type
		if (appType.length && !appMatch(appType)) 
			{
			capFilterType++;
			//logDebug("Skipping CAP " + capIDshow + ": app type doesn't match")
			continue;
			}

		// Calculate age
		
		var invoiceDate = new Date(thisInvoice.invDate.getMonth() + "/" + thisInvoice.invDate.getDayOfMonth() + "/" + thisInvoice.invDate.getYear());
		invoiceAge = daysBetween(invoiceDate,agingDateObj);
		invoiceLvl = thisInvoice.getInvLevel();
		
		logDebug("CAP:" + capIDshow + " INV:" + thisInvoice.getInvNbr() + " BAL:$" + thisInvoice.getInvoiceModel().getBalanceDue() + " DATE:" + thisInvoice.invDate.getMonth() + "/" + thisInvoice.invDate.getDayOfMonth() + "/" + thisInvoice.invDate.getYear() + " AGE:" + invoiceAge + " LVL:" + invoiceLvl);		
		capCount++;
		
		// Actions start here:
		
		
		if (invoiceAge >= 30 && invoiceLvl == "1")
			{
			updateInvoiceLevel(capId,thisInvoice,2)
			invoiceLevel2++;
			}
		
		// Run Report
		
	runReportAttach("82OaklandInvoice","RecordID",altID);

		// Add to Set
		
		if (setName != "") aa.set.add(setName,capId)

		}

	// Send the report URL		
	
	if (capCount > 0 && emailReportSetID.length && setName.length) 
	aa.sendMail("noreply@accela.com", emailReportSetID, "", batchJobName + " Report Link", reportURL + "&SetID=" + escape(setName));


	// Send the job stats email

	if (capCount > 0 && emailAddress.length) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Job Statistics" ,  "Total unpaid invoices : " + invList.length + "<BR>" + 
 												"Total invoices ignored due to application type filter : " + capFilterType + "<BR>" + 
 												"Total invoices examined : " + capCount + "<BR>" +  
												"Invoice Level 2 : " + invoiceLevel2 + "<BR>");
	
 	logMessage("INFO","Total unpaid invoices: " + invList.length);
 	logMessage("INFO","Ignored due to application type: " + capFilterType);
 	logMessage("INFO","Total CAPS processed: " + capCount);
 	}
	

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function updateInvoiceLevel(c,iObj,newLevel)
	{
	var i = iObj.getInvoiceModel()
	editResult = aa.finance.editInvoice(c,
					i.getInvNbr(),
					newLevel,
					i.getInvStatus(),
					i.getInvStatusDate() ? aa.date.parseDate(i.getInvStatusDate()) : null,
					i.getBalanceDue(),
					i.getInvAmount(),
					i.getInvDate() ? aa.date.parseDate(i.getInvDate()) : null,
					i.getInvDueDate() ? aa.date.parseDate(i.getInvDueDate()) : null,
					i.getInvComment(),
					i.getInvBatchNbr(),
					i.getInvBatchDate() ? aa.date.parseDate(i.getInvBatchDate()) : null,
					i.getUdf1(),
					i.getUdf2(),
					i.getUdf3(),
					i.getUdf4(),
					i.getPrintInvNbr(),
					i.getAuditDate() ? aa.date.parseDate(i.getAuditDate()) : null,
					i.getAuditStatus())

	if (editResult.getSuccess())
		logDebug("Updated invoice to level " +  newLevel + " successfully.");
	else
		logMessage("ERROR","ERROR: updating invoice level " + newLevel + " The reason is "  + editResult.getErrorType() + ":" + editResult.getErrorMessage());
	}
	
	
function appMatch(ats) 
	{
	var isMatch = true;
	var ata = ats.split("/");
	if (ata.length != 4)
		logDebug("ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
	else
		for (xx in ata)
			if (!ata[xx].equals(appTypeArray[xx]) && !ata[xx].equals("*"))
				isMatch = false;
	return isMatch;
	}	

function updateAppStatus(stat,cmt)
	{
	updateStatusResult = aa.cap.updateAppStatus(capId,"APPLICATION",stat, sysDate, cmt ,systemUserObj);
	if (updateStatusResult.getSuccess())
		logDebug("Updated application status to " + stat + " successfully.");
	else
		logMessage("ERROR","ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}
	
function updateTask(wfstr,wfstat,wfcomment,wfnote) 
	{

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	wfObj = workflowResult.getOutput();
  	else
  	  	{ message+="ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage() + br; return false; }
	
	if (!wfstat) wfstat = "NA";
	
	for (i in wfObj)
		{
   		fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()))
			{
			dispositionDate = aa.date.getCurrentDate();
			stepnumber = fTask.getStepNumber();
			// try status U here for disp flag?
			aa.workflow.handleDisposition(capId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"U");
			logDebug("Updating Workflow Task: " + wfstr + " with status " + wfstat);
			}			
		}
	}
	
function activateTask(wfstr) 
	{
	//optional 2nd param: wfstat.  Use if selecting by task and status.
	//SR5043
	var wfstat = "";
	var checkStatus = false;
	if (arguments.length==2)
		{
		wfstat = arguments[1];
		checkStatus = true;
		}
		
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("ERROR","ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()) ; return false; }
	
	for (i in wfObj)
		{
   		fTask = wfObj[i];
 		if ( !checkStatus && fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) ||
		     checkStatus && fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && wfstat.toUpperCase().equals(fTask.getDisposition().toUpperCase()) )
			{
			stepnumber = fTask.getStepNumber();
			aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null)
			logDebug("Activating Workflow Task: " + wfstr);
			}			
		}
	}
	
	
function addAllFees(fsched,fperiod,fqty,finvoice) // Adds all fees for a given fee schedule
	{
	var arrFees = aa.finance.getFeeItemList(null,fsched,null).getOutput();
	for (xx in arrFees)
		{
		var feeCod = arrFees[xx].getFeeCod();
		assessFeeResult = aa.finance.createFeeItem(capId,fsched,feeCod,fperiod,fqty);
		if (assessFeeResult.getSuccess())
			{
			feeSeq = assessFeeResult.getOutput();
			
			logDebug("Added Fee " + feeCod + ", Qty " + fqty);
			if (finvoice == "Y")
			{
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
				}
			}
		else
			{
			logMessage("ERROR","ERROR: assessing fee (" + feeCod + "): " + assessFeeResult.getErrorMessage());
			}
		} // for xx
	} // function
	
function addFee(fcode,fsched,fperiod,fqty,finvoice) // Adds a single fee, returns the fee descriptitem
	{
	assessFeeResult = aa.finance.createFeeItem(capId,fsched,fcode,fperiod,fqty);
	if (assessFeeResult.getSuccess())
		{
		feeSeq = assessFeeResult.getOutput();
		logDebug("Added Fee " + fcode + ", Qty " + fqty);
		if (finvoice == "Y")
			{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
			}
		return aa.finance.getFeeItemByPK(capId, feeSeq).getOutput()
           
		}
	else
		{
		logMessage("ERROR","ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		return null
		}
	}
	
function updateFee(fcode,fsched,fperiod,fqty,finvoice) // Updates a fee with a new Qty.  If it doesn't exist, adds it
	{
	feeUpdated = false;
	getFeeResult = aa.finance.getFeeItemByFeeCode(capId,fcode,fperiod);
	if (getFeeResult.getSuccess())
		{	
		feeListA = getFeeResult.getOutput();
		for (feeNum in feeListA)
			if (feeListA[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated)  // update this fee item
				{
				feeSeq = feeListA[feeNum].getFeeSeqNbr();
				editResult = aa.finance.editFeeItemUnit(capId, fqty, feeSeq);
				feeUpdated = true;
				if (editResult.getSuccess())
					{
					debug+="Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty;
					//aa.finance.calculateFees(capId);
					if (finvoice == "Y")
						{
						feeSeqList.push(feeSeq);
						paymentPeriodList.push(fperiod);
						}
					}
				else
					{ debug+= "ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage() + br; break }
				}
		}		
	else
		{ debug+= "ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage() + br}
	
	if (!feeUpdated) // no existing fee, so update
		addFee(fcode,fsched,fperiod,fqty,finvoice);
	}
	

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000) 
}	

function logMessage(etype,edesc) {
	aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
	aa.print(etype + " : " + edesc);
	emailText+=etype + " : " + edesc + "<br>";
	}

function logDebug(edesc) {
	if (showDebug) {
		aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
		aa.print("DEBUG : " + edesc);
		emailText+="DEBUG : " + edesc + "<br>"; }
	}
	
function appSpecific() {
	// 
	// Returns an associative array of App Specific Info
	//
  	appArray = new Array();
    	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);
	if (appSpecInfoResult.getSuccess())
	 	{
		var fAppSpecInfoObj = appSpecInfoResult.getOutput();

		for (loopk in fAppSpecInfoObj)
			appArray[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
		}
	return appArray;
}

function dateAdd(td,amt)   
// perform date arithmetic on a string 
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days 
// if optional parameter #3 is present, use working days only
	{
	
	useWorking = false;
	if (arguments.length == 3) 
		useWorking = true;
	
	if (!td) 
		dDate = new Date();
	else
		dDate = new Date(td);
	i = 0;
	if (useWorking)
		while (i < Math.abs(amt)) 
			{
			dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
			if (dDate.getDay() > 0 && dDate.getDay() < 6)
				i++
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
	}
	
function getCapId(pid1,pid2,pid3)  {

    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if(s_capResult.getSuccess())
      return s_capResult.getOutput();
    else
    {
      logMessage("ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
      return null;
    }
  }	

function loopTask(wfstr,wfstat,wfcomment,wfnote) // optional process name
	{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) 
		{
		processName = arguments[4]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	if (!wfstat) wfstat = "NA";
	
	for (i in wfObj)
		{
   		fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			dispositionDate = aa.date.getCurrentDate();
			stepnumber = fTask.getStepNumber();
			processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"L");
			else
				aa.workflow.handleDisposition(capId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"L");
			
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Looping...");
			}			
		}
	}

function getParam(pParamName) //gets parameter value and logs message showing param value
	{
	var ret = "" + aa.env.getValue(pParamName);	
	logMessage("PARAMETER", pParamName+" = "+ret);
	return ret;
	}
	
function isNull(pTestValue,pNewValue)
	{
	if (pTestValue==null || pTestValue=="")
		return pNewValue;
	else
		return pTestValue;
	}
	
function taskEditStatus(wfstr,wfstat,wfcomment,wfnote,pFlow,pProcess) //Batch version of function
	{
	//Needs isNull function
	//pProcess not coded yet
	//
	pFlow = isNull(pFlow,"U"); //If no flow control specified, flow is "U" (Unchanged)
	var dispositionDate = aa.date.getCurrentDate();
	
	for (i in wfObjArray)
		{
 		if ( wfstr.equals(wfObjArray[i].getTaskDescription()) )
			{
			var stepnumber = wfObjArray[i].getStepNumber();
			aa.workflow.handleDisposition(capId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj,pFlow);
			logDebug("Updating Workflow Task: " + wfstr + " with status " + wfstat);
			}			
		}
	}


	
function jsDateToMMDDYYYY(pJavaScriptDate)
	{
	//converts javascript date to string in MM/DD/YYYY format
	//
	if (pJavaScriptDate != null)
		{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
	return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		else
			{
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
			}
		}
	else
		{
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
		}
	}	
	
function jsDateToYYYYMMDD(pJavaScriptDate)
	{
	//converts javascript date to string in YYYY-MM-DD format
	//
	if (pJavaScriptDate != null)
		{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
	return pJavaScriptDate.getFullYear() + "-" + (pJavaScriptDate.getMonth()+1).toString()+"-"+pJavaScriptDate.getDate();
		else
			{
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
			}
		}
	else
		{
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
		}
	}
function lookup(stdChoice,stdValue) 
	{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		bizDomScriptObj = bizDomScriptResult.getOutput();
		var strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("getStandardChoice(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("getStandardChoice(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
	}
	
function taskStatus(wfstr) 
	{
	//Batch version of taskStatus -- uses global var wfObjArray
	// optional process name
	// returns false if task not found
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) 
		{
		processName = arguments[1]; // subprocess
		useProcess = true;
		}
	
	for (i in wfObjArray)
		{
   		var fTask = wfObjArray[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			return fTask.getDisposition()
		}
	return false;
	}
	

function isTaskStatus(wfstr,wfstat) // optional process name
	{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 2) 
		{
		processName = arguments[2]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ 
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); 
		return false; 
		}
	
	for (i in wfObj)
		{
   		fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			if (fTask.getDisposition()!=null)
				{
				if (fTask.getDisposition().toUpperCase().equals(wfstat.toUpperCase()))
					return true;
				else
					return false;
				}
		}
	return false;
	}


function nextWorkDay(td)   
	// uses app server to return the next work day.
	// Only available in 6.3.2
	// td can be "mm/dd/yyyy" (or anything that will convert to JS date)
	{
	
	if (!td) 
		var dDate = new Date();
	else
		var dDate = new Date(td);

	if (!aa.calendar.getNextWorkDay)
		{
		aa.print("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
		}
	else
		{
		var dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
		}

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();;
	}


function lastDayOfMonth(td)
	{
	if (!td) 
		var dDate = new Date();
	else
		var dDate = new Date(td);
		
	var startDay = dDate.getDate();
	var currentDay = startDay;
		
	do
		{
		currentDay++;
		dDate.setDate(currentDay)
		}
	while (dDate.getDate() > startDay)
	
	return currentDay-1;
	}
		
function lastWorkingDayOfMonth(td)
	{
	if (!td) 
		dDate = new Date();
	else
		dDate = new Date(td);

	
	lastDay = lastDayOfMonth(dDate);	
	
	do
		{
		lastDay--;
		dDate.setDate(lastDay);
		tryDate = new Date(nextWorkDay((dDate.getMonth() + 1) + "/" +  dDate.getDate() + "/" + dDate.getFullYear()))
		}
	while ((tryDate.getDate() -1) != lastDay)
	
	return (tryDate.getMonth() + 1) + "/" + tryDate.getDate() + "/" + tryDate.getFullYear();
	}
	  
function scheduleInspectDate(iType,DateToSched) // optional inspector ID.  This function requires dateAdd function
	{
	var inspectorObj = null;
	if (arguments.length == 3) 
		{
		var inspRes = aa.person.getUser(arguments[2])
		if (inspRes.getSuccess())
			inspectorObj = inspRes.getOutput();
		}

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), null, iType, "Scheduled via Script")
	
	if (schedRes.getSuccess())
		logMessage("INFO","Successfully scheduled inspection : " + iType + " for " + DateToSched);
	else
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}


function addMonthsToDate(startDate, numMonths) {
    var addYears = Math.floor(numMonths/12);
    var addMonths = numMonths - (addYears * 12);
    var newMonth = startDate.getMonth() + addMonths;
    if (startDate.getMonth() + addMonths > 11) {
      ++addYears;
      newMonth = startDate.getMonth() + addMonths - 12;
    }
    var newDate = new Date(startDate.getFullYear()+addYears,newMonth,startDate.getDate(),startDate.getHours(),startDate.getMinutes(),startDate.getSeconds());

    // adjust to correct month
    while (newDate.getMonth() != newMonth) {
      newDate = addDaysToDate(newDate, -1);
    }

    return newDate;
}

function daysBetween(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)
    
    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

function addAppCondition(cType,cStatus,cDesc,cComment,cImpact)
	{
	var addCapCondResult = aa.capCondition.addCapCondition(capId, cType, cDesc, cComment, sysDate, null, sysDate, null,null, cImpact, systemUserObj, systemUserObj, cStatus, currentUserID, "A")
        if (addCapCondResult.getSuccess())
        	{
		logMessage("Successfully added condition (" + cImpact + ") " + cDesc);
		logDebug("Successfully added condition (" + cImpact + ") " + cDesc);
		}
	else
		{
		logDebug( "**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
		}
	}
function runReportAttach(aaReportName,aaReportParamName,aaReportParamValue)
{
	var reportName = aaReportName;
	
	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput(); 
	cap = aa.cap.getCap(capId).getOutput();
 	appTypeResult = cap.getCapType();
 	appTypeString = appTypeResult.toString(); 
 	appTypeArray = appTypeString.split("/");
	
	report.setModule(appTypeArray[0]); 
	report.setCapId(capId); 
	
	var parameters = aa.util.newHashMap();	
	//Make sure the parameters includes some key parameters. 
	parameters.put(aaReportParamName, aaReportParamValue);
	
	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		
		if(reportResult) 
		{ 
			reportResult = reportResult.getOutput(); 
			var reportFile = aa.reportManager.storeReportToDisk(reportResult); 

			reportFile = reportFile.getOutput();
		}
		logDebug("Report has been run for " + altID);

	}
	else
		logDebug("No permission to report: "+ reportName + " for Admin" + systemUserObj);
}