var sysDate;
var systemUserObj;
var vBeginDate;
var vBeginDateString;
var vEndDate;
var vToday;
var vTodayString;
var vYesterdayString;
var getCapIdResult;
var capIdArray;
var i;
var capId;
var capId1;
var capId2;
var capId3;
var servProvCode;
var capIDString;
var cap;
var appTypeResult;
var appTypeString;
var appTypeArray;
var capName;
var capStatus;
var vUpdated;
var vStatusSkip;
var useAppSpecificGroupName = false;

vStatusSkip = [];
vStatusSkip.push('Final');
vStatusSkip.push('Co Issued');
vStatusSkip.push('Cancelled');
vStatusSkip.push('Certificate Issued');
vStatusSkip.push('Expired');
vStatusSkip.push('PERMIT EXPIRED');
vStatusSkip.push('Permit Expired');
vStatusSkip.push('Monitoring - Completed');
vStatusSkip.push('Ongoing Monitoring');
vStatusSkip.push('Revoked');
vStatusSkip.push('Void');
vStatusSkip.push('Withdraw');
vStatusSkip.push('Withdrawn');
vStatusSkip.push('AMR Approved');
vStatusSkip.push('Application Inactive');

sysDate = aa.date.getCurrentDate();
systemUserObj = aa.person.getUser('ADMIN').getOutput(); 

vToday = new Date();
vTodayString = getFormattedDate(vToday);
vYesterdayString = dateAdd(vTodayString,-1);

vBeginDateString = dateAdd(vTodayString,-1825);

vBeginDate = aa.date.parseDate(vBeginDateString); 
vEndDate = aa.date.parseDate(vYesterdayString);

getCapIdResult = aa.cap.getCapIDsByAppSpecificInfoDateRange('KEY DATES', 'Application Expiration Date', vBeginDate, vEndDate); 
if (!getCapIdResult.getSuccess()) { 
	aa.print("**ERROR","Retreiving Cap Id's by Application Specific field date range: " + getCapIdResult.getErrorMessage()+ "."); 
} 

capIdArray = getCapIdResult.getOutput(); //Array of CapIdScriptModel Objects 

aa.print("There were ["+capIdArray.length+"] records found."); 
vUpdated = 0;

for (i in capIdArray) { 
	capId = capIdArray[i].getCapID(); // CapIDModel Object 
	capId1 = capId.getID1(); 
	capId2 = capId.getID2(); 
	capId3 = capId.getID3();
	capId = aa.cap.getCapID(capId1,capId2,capId3).getOutput();		
	
	if(capId != null){
		servProvCode = capId.getServiceProviderCode();
		capIDString = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		vASIPermitExpDate = getAppSpecific("Permit Expiration Date",capId);
	}
	
	if (!exists(capStatus,vStatusSkip) && appTypeArray[0] == 'Building' && (vASIPermitExpDate == null || vASIPermitExpDate == "")) {
		aa.print("Updating record: " + capIDString + ". Setting record status to 'Expired'.")
		updateAppStatus('Application Inactive','Application Updated by batch script on ' + vTodayString, capId);
		vUpdated++;
	}
}
aa.print("Updated ["+vUpdated+"] records."); 

/*----------------------------------------------- Functions --------------------------------------------------*/
function getFormattedDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return month + '/' + day + '/' + year;
}

function dateAdd(td, amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDate = new Date();
	else
		dDate = convertDate(td);

	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay) {
			aa.print("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt)) {
				dDate.setDate(dDate.getDate() + parseInt((amt > 0 ? 1 : -1), 10));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
			}
		} else {
			while (i < Math.abs(amt)) {
				if (amt > 0) {
					dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;
				} else {
					dDate = new Date(aa.calendar.getPreviousWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;

				}
			}
		}
	else
		dDate.setDate(dDate.getDate() + parseInt(amt, 10));

	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	aa.print("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}

function updateAppStatus(stat,cmt) // optional cap id
{
	var itemCap = capId;
	if (arguments.length == 3) 
		itemCap = arguments[2]; // use cap ID specified in args
	var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
	if (!updateStatusResult.getSuccess()) {
		aa.print("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}
}

function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}


function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ aa.print("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ aa.print( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

